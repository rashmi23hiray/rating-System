require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_store_rating_jwt_key_2026',
  JWT_EXPIRES_IN: '7d'
};
