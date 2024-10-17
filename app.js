// app.js
const express = require('express');
const sql = require('mssql');
const insertUpdateRoutes = require('./routes/insertUpdateRoutes');
const config = require('./dbConfig');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Replace with the frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow the methods your API needs
  credentials: true // If you need to support cookies or other credentials
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
