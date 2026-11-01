# Store Rating & Review Platform

A full-stack web application built for the **FullStack Intern Coding Challenge**. The application allows users to register, browse registered merchant stores, search stores, and submit/modify 1-5 star ratings with role-based access control (System Administrator, Normal User, and Store Owner).

---

## 🚀 Quick Start (Execution)

### 1. Start the Full-Stack Application
From the `project` root directory:
```bash
npm start
```
The server will start at:
👉 **http://localhost:5000**

Both the **Express REST API** and the compiled **React Single Page Application** are served from this single unified server!

*(Optional: For frontend hot-reloading development, run `npm run dev:frontend` to launch Vite at http://localhost:3000).*

---

## ⚡ Pre-Configured Demo Accounts (1-Click in UI)

The login page contains **1-click demo buttons** to instantly fill credentials for any role:

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@storerating.com` | `Admin@1234` | System dashboard stats, add stores, add users (admin/user/owner), view & filter all stores and users with owner ratings, sortable tables. |
| **Store Owner** | `martinez@freshmart.com` | `Owner@1234` | View average store rating score, review breakdown (5★-1★), and inspect customer list who reviewed their store with timestamps. |
| **Normal User** | `samantha.robinson@example.com` | `User@1234` | Search stores by name or address, view overall ratings, submit and modify individual 1 to 5 star ratings. |

---

## 🛠️ Tech Stack & Architecture

- **Backend**: Node.js & Express.js
- **Database**: Relational SQLite / PostgreSQL compatible schema with foreign keys, indexes, and constraints (`users`, `stores`, `ratings`).
- **Frontend**: React.js (Vite), Modular CSS, Lucide React icons.
- **Authentication**: Stateless JWT tokens (7-day expiry), bcryptjs password hashing.
- **Form Validations**: Live frontend validation indicators + backend validation middleware.

---

## 📋 Features by Role

### 1. System Administrator
- **Dashboard Metrics**:
  - Total number of registered users (with role breakdown)
  - Total number of registered stores
  - Total number of submitted ratings
- **User Management**:
  - Add new users (Admin, Normal User, or Store Owner) with strict field validations.
  - View all users with columns: Name, Email, Address, Role.
  - **Store Owner Rating**: If a user is a Store Owner, their store's overall average rating is dynamically calculated and displayed.
  - Filters by Name, Email, Address, and Role.
  - Full ascending/descending sorting on all key columns.
- **Store Management**:
  - Add new stores (Name, Email, Address, and optional assigned Store Owner).
  - View stores table with Name, Email, Address, Overall Rating, and assigned Owner.
  - Sorting and filtering by Name, Email, Address, and Rating.
- **Logout**.

### 2. Normal User
- **User Registration**:
  - Sign up with Name, Email, Address, Password.
  - Character counter (Min 20, Max 60 characters) and real-time validation checklist.
- **Browse & Search Stores**:
  - Live search by Store Name or Physical Address.
  - Table sorting (Ascending/Descending) on Name, Address, Overall Rating, and Your Rating.
- **Ratings & Reviews**:
  - Visual 1 to 5 star rating display.
  - Interactive star rating picker (1 to 5 stars) with descriptive hints.
  - Ability to **submit** a new rating or **modify** an existing rating at any time.
- **Account**:
  - Change password with old/new password validation.
  - Logout.

### 3. Store Owner
- **Store Dashboard**:
  - Overall store average rating score and star display.
  - Total review count.
  - Rating distribution breakdown (5★, 4★, 3★, 2★, 1★ bars).
  - Table of customers who rated their store: Customer Name, Email, Address, Submitted Rating, and Date.
  - Sorting and filtering across customer raters.
- **Account**:
  - Change password.
  - Logout.

---

## 🔒 Form Validations (Enforced on Frontend & Backend)

| Field | Rule | Validation Pattern |
| :--- | :--- | :--- |
| **Name** | Min 20 characters, Max 60 characters | `len >= 20 && len <= 60` |
| **Address** | Max 400 characters | `len > 0 && len <= 400` |
| **Password** | 8 to 16 characters, ≥1 uppercase letter, ≥1 special character | `^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$` |
| **Email** | Standard valid RFC email format | `^[^\s@]+@[^\s@]+\.[^\s@]+$` |
| **Rating** | Integer between 1 and 5 | `1 <= rating <= 5` |

---

## 🗄️ Database Schema

### `users`
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `name` (VARCHAR(60) NOT NULL)
- `email` (VARCHAR(255) UNIQUE NOT NULL)
- `password` (VARCHAR(255) NOT NULL - bcrypt hash)
- `address` (VARCHAR(400) NOT NULL)
- `role` (TEXT NOT NULL - 'admin', 'user', 'owner')
- `created_at`, `updated_at` (TIMESTAMP)

### `stores`
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `name` (VARCHAR(60) NOT NULL)
- `email` (VARCHAR(255) UNIQUE NOT NULL)
- `address` (VARCHAR(400) NOT NULL)
- `owner_id` (INTEGER, FOREIGN KEY -> `users.id`)
- `created_at`, `updated_at` (TIMESTAMP)

### `ratings`
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `user_id` (INTEGER NOT NULL, FOREIGN KEY -> `users.id`)
- `store_id` (INTEGER NOT NULL, FOREIGN KEY -> `stores.id`)
- `rating` (INTEGER NOT NULL, CHECK `rating BETWEEN 1 AND 5`)
- `created_at`, `updated_at` (TIMESTAMP)
- `UNIQUE(user_id, store_id)`: Enforces one rating per user per store (with modification support).

---

## 🧪 Automated Testing
Run the comprehensive E2E test suite:
```bash
node test_suite.js
```
*(Ensure `npm start` is running in another window, or run tests directly against the API).*

