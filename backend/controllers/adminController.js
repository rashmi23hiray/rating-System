const bcrypt = require('bcryptjs');
const db = require('../models/db');
const {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword
} = require('../utils/validators');

// 1. Dashboard Statistics
exports.getDashboardStats = (req, res) => {
  try {
    const totalUsers = db.get('SELECT COUNT(*) as count FROM users').count;
    const totalStores = db.get('SELECT COUNT(*) as count FROM stores').count;
    const totalRatings = db.get('SELECT COUNT(*) as count FROM ratings').count;

    // Additional breakdown
    const userRoleCounts = db.all('SELECT role, COUNT(*) as count FROM users GROUP BY role');

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalStores,
        totalRatings,
        roleBreakdown: userRoleCounts
      }
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching dashboard stats.' });
  }
};

// 2. View all users with filters and sorting
exports.getUsers = (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'id', sortOrder = 'desc' } = req.query;

    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.address, 
        u.role, 
        u.created_at,
        s.id AS store_id,
        s.name AS store_name,
        ROUND(AVG(r.rating), 2) AS owner_rating
      FROM users u
      LEFT JOIN stores s ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND LOWER(u.name) LIKE ?';
      params.push(`%${name.trim().toLowerCase()}%`);
    }
    if (email) {
      query += ' AND LOWER(u.email) LIKE ?';
      params.push(`%${email.trim().toLowerCase()}%`);
    }
    if (address) {
      query += ' AND LOWER(u.address) LIKE ?';
      params.push(`%${address.trim().toLowerCase()}%`);
    }
    if (role && role !== 'all') {
      query += ' AND u.role = ?';
      params.push(role.trim());
    }

    query += ' GROUP BY u.id';

    // Safe sorting
    const allowedSortFields = {
      id: 'u.id',
      name: 'u.name',
      email: 'u.email',
      address: 'u.address',
      role: 'u.role',
      rating: 'owner_rating',
      created_at: 'u.created_at'
    };
    const sortField = allowedSortFields[sortBy] || 'u.id';
    const direction = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortField} ${direction}`;

    const users = db.all(query, params);

    res.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
        createdAt: u.created_at,
        storeId: u.store_id,
        storeName: u.store_name,
        rating: u.role === 'owner' ? (u.owner_rating !== null ? Number(u.owner_rating) : 0) : null
      }))
    });
  } catch (error) {
    console.error('Admin getUsers Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching users list.' });
  }
};

// 3. Add new user (admin, normal user, or store owner)
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    const allowedRoles = ['admin', 'user', 'owner'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Role must be one of: ${allowedRoles.join(', ')}.` });
    }

    const nameCheck = validateName(name);
    if (!nameCheck.isValid) return res.status(400).json({ success: false, message: nameCheck.message });

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) return res.status(400).json({ success: false, message: emailCheck.message });

    const addressCheck = validateAddress(address);
    if (!addressCheck.isValid) return res.status(400).json({ success: false, message: addressCheck.message });

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) return res.status(400).json({ success: false, message: passwordCheck.message });

    const existing = db.get('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.run(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), role]
    );

    const newUser = db.get('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'New user created successfully.',
      user: newUser
    });
  } catch (error) {
    console.error('Admin addUser Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error creating user.' });
  }
};

// 4. View all stores with filters and sorting
exports.getStores = (req, res) => {
  try {
    const { name, email, address, sortBy = 'id', sortOrder = 'desc' } = req.query;

    let query = `
      SELECT 
        s.id,
        s.name,
        s.email,
        s.address,
        s.created_at,
        u.id AS owner_id,
        u.name AS owner_name,
        ROUND(AVG(r.rating), 2) AS rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON r.store_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (name) {
      query += ' AND LOWER(s.name) LIKE ?';
      params.push(`%${name.trim().toLowerCase()}%`);
    }
    if (email) {
      query += ' AND LOWER(s.email) LIKE ?';
      params.push(`%${email.trim().toLowerCase()}%`);
    }
    if (address) {
      query += ' AND LOWER(s.address) LIKE ?';
      params.push(`%${address.trim().toLowerCase()}%`);
    }

    query += ' GROUP BY s.id';

    const allowedSortFields = {
      id: 's.id',
      name: 's.name',
      email: 's.email',
      address: 's.address',
      rating: 'rating',
      total_ratings: 'total_ratings',
      created_at: 's.created_at'
    };
    const sortField = allowedSortFields[sortBy] || 's.id';
    const direction = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortField} ${direction}`;

    const stores = db.all(query, params);

    res.json({
      success: true,
      stores: stores.map(s => ({
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        rating: s.rating !== null ? Number(s.rating) : 0,
        totalRatings: Number(s.total_ratings),
        ownerId: s.owner_id,
        ownerName: s.owner_name || 'Unassigned',
        createdAt: s.created_at
      }))
    });
  } catch (error) {
    console.error('Admin getStores Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching stores.' });
  }
};

// 5. Add new store
exports.addStore = (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const nameCheck = validateName(name);
    if (!nameCheck.isValid) return res.status(400).json({ success: false, message: nameCheck.message });

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) return res.status(400).json({ success: false, message: emailCheck.message });

    const addressCheck = validateAddress(address);
    if (!addressCheck.isValid) return res.status(400).json({ success: false, message: addressCheck.message });

    const existing = db.get('SELECT id FROM stores WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Store with this email already exists.' });
    }

    let validOwnerId = null;
    if (ownerId) {
      const owner = db.get('SELECT id, role FROM users WHERE id = ?', [ownerId]);
      if (!owner || owner.role !== 'owner') {
        return res.status(400).json({ success: false, message: 'Selected owner is not a registered Store Owner.' });
      }
      validOwnerId = owner.id;
    }

    const result = db.run(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), address.trim(), validOwnerId]
    );

    const newStore = db.get('SELECT * FROM stores WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Store added successfully.',
      store: newStore
    });
  } catch (error) {
    console.error('Admin addStore Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error adding store.' });
  }
};
