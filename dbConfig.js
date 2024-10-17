const sql = require('mssql');

const config = {
  user: 'WT1-SQL-Admin',
  password: 'W3llTr@ck1',
  port: 1433,
  server: 'WT1-SQL-v\WT1', // e.g., 'localhost\\SQLEXPRESS'
  database: 'Wellness_eCastEMR_Data',
  options: {
    encrypt: false, // Set to true if using Azure, false for local SQL Server
    trustServerCertificate: true, // Add this line
    enableArithAbort: true,
  },
};

module.exports = config;