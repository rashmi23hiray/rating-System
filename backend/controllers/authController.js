const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');
const {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword
} = require('../utils/validators');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// User Registration (Normal User)
exports.register = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Strict Validations
    const nameCheck = validateName(name);
    if (!nameCheck.isValid) return res.status(400).json({ success: false, message: nameCheck.message });

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) return res.status(400).json({ success: false, message: emailCheck.message });

    const addressCheck = validateAddress(address);
    if (!addressCheck.isValid) return res.status(400).json({ success: false, message: addressCheck.message });

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) return res.status(400).json({ success: false, message: passwordCheck.message });

    // Check if email already registered
    const existing = db.get('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with this email address already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = db.run(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashedPassword, address.trim(), 'user']
    );

    const newUser = db.get('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?', [result.lastInsertRowid]);
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

// Unified Login for All User Roles (Admin, Normal User, Store Owner)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role
    };

    // If Store Owner, attach store information
    if (user.role === 'owner') {
      const store = db.get('SELECT id, name, address, email FROM stores WHERE owner_id = ?', [user.id]);
      safeUser.store = store || null;
    }

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

// Update Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current password and new password are required.' });
    }

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.isValid) {
      return res.status(400).json({ success: false, message: passwordCheck.message });
    }

    const user = db.get('SELECT password FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match.' });
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    db.run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedNew, userId]);

    res.json({ success: true, message: 'Password has been updated successfully.' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error while updating password.' });
  }
};

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = db.get('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'owner') {
      const store = db.get('SELECT id, name, address, email FROM stores WHERE owner_id = ?', [user.id]);
      user.store = store || null;
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
