import * as dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import * as mariadb from 'mariadb';
import { formatTweet } from './bluesky';

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
    const query = 'SELECT * FROM events WHERE isPastEvent = 0';
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
    let eventURL;
    let eventName;
    let eventTime;
    let ticketAmount;
    for (const row of rows) {
      const url = row.url;
      if (url) {
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const tickets = await page.evaluate(() => {
            const elementsTest = document.querySelector('div[id*="event_detail_ticket_purchase"] p');
            if (elementsTest) {
                return elementsTest.textContent?.replace("Available Tickets: ", "").trim();
            }
            return null;
        });
        
        if (Number(tickets) > 0) {
          let ticketAmount = `${tickets} ticket(s)`;
          eventURL = row.url;

          if (eventURL === 'file:///home/megan/Documents/Typescript/lorcana-bluesky/test/index.html') {
            eventURL = 'https://gencon.com/events/238936';
          }
          eventName = row.event_name;
          eventTime = formatDate(row.event_time);

          const tweetMsg = `${eventName}\n${eventTime}\n${ticketAmount}\n${eventURL}`;
          formatTweet(tweetMsg);
        }
      }
    }

    await browser.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (connection) connection.end();
  }
}



function formatDate(dateString: string): string {
  const date = new Date(dateString);

  const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
  const dayOfWeek = dayFormatter.format(date);

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZoneName: 'short'
  });
  const time = timeFormatter.format(date);

  return `${dayOfWeek} ${time}`;
}


openPagesAndPrintTitles();
