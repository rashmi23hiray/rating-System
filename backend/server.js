const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT } = require('./config');
const seedDatabase = require('./seed');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const storeRoutes = require('./routes/storeRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Auto-seed database with initial users, stores, and ratings
seedDatabase().catch(err => console.error('Auto-seed error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', storeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'store-rating-api', timestamp: new Date() });
});

// Serve frontend build if present
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('API is running. Build frontend with "npm run build" to view UI here.');
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`Store Rating API running on http://localhost:${PORT}`);
  console.log(`Environment: development`);
  console.log(`===============================================`);
});
