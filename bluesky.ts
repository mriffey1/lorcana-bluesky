import { BskyAgent } from '@atproto/api';
import { RichText } from '@atproto/api';
import * as dotenv from 'dotenv';
dotenv.config();

const agent = new BskyAgent({
  service: 'https://bsky.social',
});

async function run() {
  await agent.login({
    identifier: process.env.BLUESKY_USERNAME || '',
    password: process.env.BLUESKY_PASSWORD || '',
  });

  const rt = new RichText({
    text: 'This is a test to test updated env creds. @senshi.tokyo',
  });
  await rt.detectFacets(agent);
  const postRecord = {
    $type: 'app.bsky.feed.post',
    text: rt.text,
    facets: rt.facets,
    createdAt: new Date().toISOString(),
  };  

  await agent.post(
   postRecord
  );
}

run().catch(console.error);
