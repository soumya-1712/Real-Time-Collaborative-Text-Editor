// src/test-db.js

// Load environment variables from your .env file
require('dotenv').config();

const { MongoClient } = require('mongodb');

// This is the same URI your main application uses
const uri = process.env.MONGO_URI;

// Check if the URI was loaded correctly
if (!uri) {
  console.error('❌ ERROR: MONGO_URI is not defined in your .env file.');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB Atlas...');
console.log('URI:', uri.replace(/:([^:]+)@/, ':<password>@')); // Logs the URI safely

const client = new MongoClient(uri);

async function runTest() {
  try {
    // connect() will hang here if there's a network block
    await client.connect(); 
    
    // If this line is reached, the connection was successful
    console.log('✅✅✅ MongoDB Connection Successful! ✅✅✅');
    console.log('The problem is NOT your network or .env file.');

  } catch (err) {
    // If an error occurs, it will be printed here
    console.error('❌❌❌ MongoDB Connection FAILED! ❌❌❌');
    console.error(err);

  } finally {
    // This ensures the script closes the connection and exits
    await client.close();
    console.log('Connection closed.');
  }
}

runTest();