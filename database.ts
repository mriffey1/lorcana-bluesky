import * as dotenv from 'dotenv';
dotenv.config();

const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.HOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DATABASE,
  connectionLimit: 20,
  connectTimeout: 20000,
});

export async function getEvents() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    const query = 'SELECT id, event_name, url, event_time, last_tweet, isPastEvent FROM events';
    const rows = await connection.query(query);
    
    // Display each row in the console
    rows.forEach((row: any) => {
      console.log(row);
    });
  } catch (err) {
    console.error('Error retrieving data:', err);
  } finally {
    if (connection) connection.end(); 
  }
}


getEvents();
