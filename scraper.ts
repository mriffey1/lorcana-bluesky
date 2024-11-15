import * as dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import * as mariadb from 'mariadb';

dotenv.config();

const pool = mariadb.createPool({
  host: process.env.HOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DATABASE,
  connectionLimit: 20,
  connectTimeout: 20000,
});

async function openPagesAndPrintTitles() {
  let connection;
  try {
    connection = await pool.getConnection();
    const query = 'SELECT url FROM events WHERE isPastEvent = 0';
    const rows = await connection.query(query);

    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser', 
      headless: false,
      defaultViewport: null, 
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--start-maximized',
        '--remote-debugging-port=9222',
        '--user-data-dir=/home/megan/.config/chromium', 
      ],
    });

    const page = await browser.newPage();

    for (const row of rows) {
      const url = row.url;
      if (url) {
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const result = await page.evaluate(() => {
            const elementsTest = document.querySelector('div[id*="event_detail_ticket_purchase"] p');
            if (elementsTest) {
                return elementsTest.textContent?.replace("Available Tickets: ", "").trim();
            }
            return null;
        });
        
        console.log('Element details:', result);
        console.log(`Opening URL: ${url}`);
     
        const pageTitle = await page.title();
        console.log(`Page Title: ${pageTitle}`);
      }
    }

    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (connection) connection.end();
  }
}


openPagesAndPrintTitles();
