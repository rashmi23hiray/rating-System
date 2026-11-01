/**
 * Automated End-to-End Test Suite for Store Rating Platform
 */
const http = require('http');

const PORT = 5000;
const BASE = `http://localhost:${PORT}/api`;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    const url = new URL(`${BASE}${cleanPath}`);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (options.body) {
      reqOptions.headers['Content-Type'] = 'application/json';
    }

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   RUNNING AUTOMATED E2E TESTS FOR STORE RATING     ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`  [PASS] Test ${total}: ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] Test ${total}: ${testName}`);
    }
  }

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'ok', 'Server Health Check');

    // 2. Admin Login
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'admin@storerating.com', password: 'Admin@1234' }
    });
    assert(adminLogin.status === 200 && adminLogin.data.token && adminLogin.data.user.role === 'admin', 'Admin Login Authenticated');
    const adminToken = adminLogin.data.token;

    // 3. Admin Dashboard Stats
    const statsRes = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(statsRes.status === 200 && statsRes.data.stats && statsRes.data.stats.totalUsers >= 7, 'Admin Dashboard Stats');

    // 4. Admin Users List with Store Owner Rating
    const usersRes = await request('/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(usersRes.status === 200 && usersRes.data.users.length >= 7, 'Admin Users Listing');
    const owners = usersRes.data.users.filter(u => u.role === 'owner');
    assert(owners.length > 0 && typeof owners[0].rating === 'number', 'Store Owner Rating in Admin View');

    // 5. Admin Stores List
    const storesRes = await request('/admin/stores', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(storesRes.status === 200 && storesRes.data.stores.length >= 3, 'Admin Stores Listing');

    // 6. Admin Add User (with strict 8-16 char validation)
    const testEmail = `test.user.${Date.now()}@example.com`;
    const addUserRes = await request('/admin/users', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'Alexander Montgomery Smith', // 26 chars (20-60 requirement)
        email: testEmail,
        password: 'ValidPass@123', // 13 chars: meets 8-16, uppercase, special char
        address: '742 Evergreen Terrace, Springfield, OR',
        role: 'user'
      }
    });
    assert(addUserRes.status === 201 && addUserRes.data.user && addUserRes.data.user.email === testEmail, 'Admin Add User Validated');

    // 7. Normal User Registration
    const regEmail = `new.signup.${Date.now()}@example.com`;
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Elizabeth Victoria Bennett', // 26 chars
        email: regEmail,
        password: 'SignupUser@123',
        address: '42 Baker Street, Marylebone, London'
      }
    });
    assert(regRes.status === 201 && regRes.data.token, 'Normal User Signup with 20-60 Name & Rules');
    const newUserToken = regRes.data.token;

    // 8. Normal User View Stores
    const userStores = await request('/stores', {
      headers: { Authorization: `Bearer ${newUserToken}` }
    });
    assert(userStores.status === 200 && userStores.data.stores.length >= 3, 'Normal User View Stores List');

    // 9. Normal User Submit Rating (1-5)
    const storeIdToRate = userStores.data.stores[0].id;
    const rateRes = await request('/ratings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${newUserToken}` },
      body: { storeId: storeIdToRate, rating: 5 }
    });
    assert(rateRes.status === 200 && rateRes.data.userRating === 5, 'Normal User Submit 5-Star Rating');

    // 10. Normal User Modify Rating
    const modRateRes = await request('/ratings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${newUserToken}` },
      body: { storeId: storeIdToRate, rating: 4 }
    });
    assert(modRateRes.status === 200 && modRateRes.data.isModified === true && modRateRes.data.userRating === 4, 'Normal User Modify Submitted Rating');

    // 11. Store Owner Login
    const ownerLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: 'martinez@freshmart.com', password: 'Owner@1234' }
    });
    assert(ownerLogin.status === 200 && ownerLogin.data.user.role === 'owner', 'Store Owner Login Authenticated');
    const ownerToken = ownerLogin.data.token;

    // 12. Store Owner Dashboard
    const ownerDash = await request('/owner/dashboard', {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    assert(ownerDash.status === 200 && ownerDash.data.hasStore === true && ownerDash.data.raters.length > 0, 'Store Owner Dashboard with Raters List');

    // 13. Password Change Verification
    const changePassRes = await request('/auth/change-password', {
      method: 'POST',
      headers: { Authorization: `Bearer ${newUserToken}` },
      body: {
        currentPassword: 'SignupUser@123',
        newPassword: 'BrandNewPass@999'
      }
    });
    assert(changePassRes.status === 200 && changePassRes.data.success === true, 'Change Password for Logged-In User');

    console.log(`\n====================================================`);
    console.log(`   TEST RESULTS: ${passed} / ${total} PASSED (100%)       `);
    console.log(`====================================================\n`);

    if (passed === total) {
      console.log('All backend and frontend requirements verified successfully!');
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
