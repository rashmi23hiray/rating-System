/**
 * Validation rules strictly aligned with challenge specifications:
 * - Name: Min 20 characters, Max 60 characters
 * - Address: Max 400 characters
 * - Password: 8-16 characters, must include at least one uppercase letter and one special character
 * - Email: Must follow standard email validation rules
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
const UPPERCASE_REGEX = /[A-Z]/;

function validateName(name) {
  if (!name || typeof name !== 'string') {
    return { isValid: false, message: 'Name is required' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 20) {
    return { isValid: false, message: 'Name must be at least 20 characters long' };
  }
  if (trimmed.length > 60) {
    return { isValid: false, message: 'Name must not exceed 60 characters' };
  }
  return { isValid: true };
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email is required' };
  }
  const trimmed = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, message: 'Please provide a valid email address' };
  }
  return { isValid: true };
}

function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    return { isValid: false, message: 'Address is required' };
  }
  const trimmed = address.trim();
  if (trimmed.length === 0) {
    return { isValid: false, message: 'Address cannot be empty' };
  }
  if (trimmed.length > 400) {
    return { isValid: false, message: 'Address must not exceed 400 characters' };
  }
  return { isValid: true };
}

function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8 || password.length > 16) {
    return { isValid: false, message: 'Password must be between 8 and 16 characters long' };
  }
  if (!UPPERCASE_REGEX.test(password)) {
    return { isValid: false, message: 'Password must include at least one uppercase letter' };
  }
  if (!SPECIAL_CHAR_REGEX.test(password)) {
    return { isValid: false, message: 'Password must include at least one special character' };
  }
  return { isValid: true };
}

function validateRating(rating) {
  const num = Number(rating);
  if (!Number.isInteger(num) || num < 1 || num > 5) {
    return { isValid: false, message: 'Rating must be an integer between 1 and 5' };
  }
  return { isValid: true };
}

module.exports = {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  validateRating
};
