const axios = require('axios');

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...');
    
    const response = await axios.post('http://localhost:5000/api/auth/create-admin', {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('🎫 Token:', response.data.token);
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Error:', error.response.data.error);
    } else {
      console.error('❌ Network error. Make sure the server is running on port 5000');
    }
  }
}

// Check if server is running first
axios.get('http://localhost:5000/api/debug')
  .then(() => {
    console.log('✅ Server is running');
    createAdmin();
  })
  .catch(() => {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   cd server && npm run dev');
  });
