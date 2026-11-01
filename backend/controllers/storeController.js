const db = require('../models/db');
const { validateRating } = require('../utils/validators');

// Normal User: View stores with search by Name / Address, sort, and user's rating
exports.getAllStoresForUser = (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { search, name, address, sortBy = 'name', sortOrder = 'asc' } = req.query;

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        ROUND(AVG(all_r.rating), 2) AS overall_rating,
        COUNT(all_r.id) AS total_ratings,
        user_r.rating AS user_submitted_rating
      FROM stores s
      LEFT JOIN ratings all_r ON all_r.store_id = s.id
      LEFT JOIN ratings user_r ON user_r.store_id = s.id AND user_r.user_id = ?
      WHERE 1=1
    `;
    const params = [userId];

    // Combined search or individual filters
    if (search) {
      query += ' AND (LOWER(s.name) LIKE ? OR LOWER(s.address) LIKE ?)';
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term);
    }
    if (name) {
      query += ' AND LOWER(s.name) LIKE ?';
      params.push(`%${name.trim().toLowerCase()}%`);
    }
    if (address) {
      query += ' AND LOWER(s.address) LIKE ?';
      params.push(`%${address.trim().toLowerCase()}%`);
    }

    query += ' GROUP BY s.id';

    const allowedSortFields = {
      id: 's.id',
      name: 's.name',
      address: 's.address',
      overall_rating: 'overall_rating',
      total_ratings: 'total_ratings',
      user_rating: 'user_submitted_rating'
    };
    const sortField = allowedSortFields[sortBy] || 's.name';
    const direction = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    query += ` ORDER BY ${sortField} ${direction}`;

    const stores = db.all(query, params);

    res.json({
      success: true,
      stores: stores.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        overallRating: s.overall_rating !== null ? Number(s.overall_rating) : 0,
        totalRatings: Number(s.total_ratings),
        userSubmittedRating: s.user_submitted_rating !== null ? Number(s.user_submitted_rating) : null
      }))
    });
  } catch (error) {
    console.error('Stores list error:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching stores.' });
  }
};

// Normal User: Submit or modify rating (1 to 5)
exports.submitOrUpdateRating = (req, res) => {
  try {
    const userId = req.user.id;
    const { storeId, rating } = req.body;

    if (!storeId) {
      return res.status(400).json({ success: false, message: 'Store ID is required.' });
    }

    const ratingCheck = validateRating(rating);
    if (!ratingCheck.isValid) {
      return res.status(400).json({ success: false, message: ratingCheck.message });
    }

    const store = db.get('SELECT id, name FROM stores WHERE id = ?', [storeId]);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    // Check if rating already exists
    const existing = db.get('SELECT id, rating FROM ratings WHERE user_id = ? AND store_id = ?', [userId, storeId]);

    let isModified = false;
    if (existing) {
      db.run(
        'UPDATE ratings SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [rating, existing.id]
      );
      isModified = true;
    } else {
      db.run(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)',
        [userId, storeId, rating]
      );
    }

    // Return new overall rating for convenience
    const stats = db.get(`
      SELECT 
        ROUND(AVG(rating), 2) AS overall_rating,
        COUNT(id) AS total_ratings
      FROM ratings WHERE store_id = ?
    `, [storeId]);

    res.json({
      success: true,
      message: isModified ? 'Rating updated successfully.' : 'Rating submitted successfully.',
      isModified,
      userRating: rating,
      overallRating: stats.overall_rating !== null ? Number(stats.overall_rating) : 0,
      totalRatings: Number(stats.total_ratings)
    });
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ success: false, message: 'Internal server error submitting rating.' });
  }
};

// Store Owner Dashboard: View store details, average rating, and list of users who submitted ratings
exports.getOwnerDashboard = (req, res) => {
  try {
    const ownerId = req.user.id;
    const { sortBy = 'date', sortOrder = 'desc', search } = req.query;

    const store = db.get('SELECT * FROM stores WHERE owner_id = ?', [ownerId]);
    if (!store) {
      return res.json({
        success: true,
        hasStore: false,
        message: 'No store is currently associated with your account. Please contact an administrator.'
      });
    }

    // Overall rating stats
    const stats = db.get(`
      SELECT 
        ROUND(AVG(rating), 2) AS average_rating,
        COUNT(id) AS total_ratings
      FROM ratings WHERE store_id = ?
    `, [store.id]);

    // Raters list
    let raterQuery = `
      SELECT 
        r.id AS rating_id,
        r.rating,
        r.created_at,
        r.updated_at,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        u.address AS user_address
      FROM ratings r
      JOIN users u ON u.id = r.user_id
      WHERE r.store_id = ?
    `;
    const params = [store.id];

    if (search) {
      raterQuery += ' AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(u.address) LIKE ?)';
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term);
    }

    const sortMap = {
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      rating: 'r.rating',
      date: 'r.created_at'
    };
    const sortField = sortMap[sortBy] || 'r.created_at';
    const direction = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    raterQuery += ` ORDER BY ${sortField} ${direction}`;

    const raters = db.all(raterQuery, params);

    // Rating breakdown (distribution: 5 stars, 4 stars, etc.)
    const breakdown = db.all(`
      SELECT rating, COUNT(*) as count 
      FROM ratings 
      WHERE store_id = ? 
      GROUP BY rating 
      ORDER BY rating DESC
    `, [store.id]);

    res.json({
      success: true,
      hasStore: true,
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: stats.average_rating !== null ? Number(stats.average_rating) : 0,
        totalRatings: Number(stats.total_ratings)
      },
      ratingsBreakdown: breakdown,
      raters: raters.map(r => ({
        ratingId: r.rating_id,
        rating: r.rating,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        user: {
          id: r.user_id,
          name: r.user_name,
          email: r.user_email,
          address: r.user_address
        }
      }))
    });
  } catch (error) {
    console.error('Owner dashboard error:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching owner dashboard.' });
  }
};
