// app.js
const express = require('express');
const sql = require('mssql');
const insertUpdateRoutes = require('./routes/insertUpdateRoutes');
const config = require('./dbConfig');
const cors = require('cors');

const app = express();

const allowedOrigins = ['https://www.welltrackone.com', 'http://localhost:3000', 'https://careone-backend.com'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow non-browser requests like Postman
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // If using cookies or session authentication
}));

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());


// Handling preflight requests
app.options('*', cors());

// Use the insert/update routes
app.use('/api', insertUpdateRoutes);

// Function to test the database connection
const testDatabaseConnection = async () => {
  try {
    const pool = await sql.connect(config);
    console.log('Database connection successful!');
    await pool.close(); // Close the connection after testing
  } catch (err) {
    console.error('Database connection failed:', err);
  }
};

// Call the test function before starting the server
testDatabaseConnection().then(() => {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
