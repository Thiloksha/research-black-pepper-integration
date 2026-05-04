// config/db.js

const mongoose = require('mongoose');
const dns = require('dns');

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

const connectDB = async ({ retries = 5, delay = 2000 } = {}) => {
  global.dbConnected = false;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠️ No MONGODB_URI found. Skipping database connection.");
    return;
  }

  // Force Node resolver to use reliable public DNS for SRV lookups
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.log('Using DNS servers:', dns.getServers());
  } catch (e) {
    console.warn('Failed to set DNS servers:', e.message);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(uri);
      global.dbConnected = true;
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      global.dbConnected = false;
      console.error(`❌ MongoDB Connection Error (attempt ${attempt}/${retries}): ${error.message}`);
      if (attempt < retries) {
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }
  console.error('❌ MongoDB: all connection attempts failed.');
};

module.exports = connectDB;