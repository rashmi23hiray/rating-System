const bcrypt = require('bcryptjs');
const db = require('./models/db');

async function seedDatabase() {
  console.log('Seeding database with verified test data...');

  // Check if admin already exists
  const existingAdmin = db.get("SELECT id FROM users WHERE email = 'admin@storerating.com'");
  if (existingAdmin) {
    console.log('Database already initialized. Skipping seed.');
    return;
  }

  const adminPass = await bcrypt.hash('Admin@1234', 10);
  const ownerPass = await bcrypt.hash('Owner@1234', 10);
  const userPass = await bcrypt.hash('User@1234', 10);

  // 1. Insert System Admin
  db.run(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'System Administrator Account',
      'admin@storerating.com',
      adminPass,
      '100 Innovation Boulevard, Tech Park, Suite 400, San Francisco, CA',
      'admin'
    ]
  );

  // 2. Insert Store Owners
  const o1 = db.run(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Christopher David Martinez',
      'martinez@freshmart.com',
      ownerPass,
      '452 West Blossom Avenue, Green Valley, CA',
      'owner'
    ]
  );

  const o2 = db.run(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Victoria Elizabeth Jenkins',
      'jenkins@techhaven.com',
      ownerPass,
      '789 Silicon Crescent, Sector 9, Austin, TX',
      'owner'
    ]
  );

  const o3 = db.run(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Alexander Benjamin Taylor',
      'taylor@urbanbookstore.com',
      ownerPass,
      '12 Highland Road, Heritage District, Boston, MA',
      'owner'
    ]
  );

  // 3. Insert Normal Users
  const u1 = db.run(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Samantha Jennifer Robinson',
      'samantha.robinson@example.com',
      userPass,
      '102 Pine Crest Drive, Apt 4B, Springfield, IL',
      'user'
    ]
  );

  const u2 = db.run(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Jonathan Edward Richardson',
      'jonathan.richardson@example.com',
      userPass,
      '55 Elmwood Terrace, Greenfield, MA',
      'user'
    ]
  );

  const u3 = db.run(
    'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
    [
      'Katherine Michelle Williams',
      'katherine.williams@example.com',
      userPass,
      '88 Lakeview Parkway, Lakeside, FL',
      'user'
    ]
  );

  // 4. Insert Stores
  const s1 = db.run(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [
      'FreshMart Organic Grocery',
      'contact@freshmart.com',
      '452 West Blossom Avenue, Green Valley, CA',
      o1.lastInsertRowid
    ]
  );

  const s2 = db.run(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [
      'TechHaven Electronics & Gadgets',
      'support@techhaven.com',
      '789 Silicon Crescent, Sector 9, Austin, TX',
      o2.lastInsertRowid
    ]
  );

  const s3 = db.run(
    'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
    [
      'Urban Pages Independent Books',
      'hello@urbanbookstore.com',
      '12 Highland Road, Heritage District, Boston, MA',
      o3.lastInsertRowid
    ]
  );

  // 5. Insert Ratings (1 to 5)
  // Samantha rates
  db.run('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [u1.lastInsertRowid, s1.lastInsertRowid, 5]);
  db.run('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [u1.lastInsertRowid, s2.lastInsertRowid, 4]);

  // Jonathan rates
  db.run('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [u2.lastInsertRowid, s1.lastInsertRowid, 4]);
  db.run('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [u2.lastInsertRowid, s3.lastInsertRowid, 5]);

  // Katherine rates
  db.run('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [u3.lastInsertRowid, s2.lastInsertRowid, 3]);
  db.run('INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)', [u3.lastInsertRowid, s3.lastInsertRowid, 4]);

  console.log('Seeding completed successfully:');
  console.log('  Admin: admin@storerating.com (Pass: Admin@1234)');
  console.log('  Owner: martinez@freshmart.com (Pass: Owner@1234)');
  console.log('  User:  samantha.robinson@example.com (Pass: User@1234)');
}

if (require.main === module) {
  seedDatabase().catch(err => {
    console.error('Seed Error:', err);
    process.exit(1);
  });
}

module.exports = seedDatabase;
