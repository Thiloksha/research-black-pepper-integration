// // config/db.js

// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`❌ MongoDB Connection Error: ${error.message}`);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

// config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn("⚠️ No MONGODB_URI found. Skipping database connection.");
      return;
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // process.exit(1);
  }
};

module.exports = connectDB;