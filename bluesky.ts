import { BskyAgent } from '@atproto/api';
import { RichText } from '@atproto/api';
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();



// // Create the post with the image embed
// await agent.post({
//   text: 'Check out this image!',
//   embed: {
//     $type: 'app.bsky.embed.images',
//     images: [
//       {
//         image: uploadData.blob,
//         alt: 'Description of the image',
//       },
//     ],
//   },
//   createdAt: new Date().toISOString(),
// });


export async function formatTweet(tweetMessage){
  const agent = new BskyAgent({
    service: 'https://bsky.social',
  });
  await agent.login({
    identifier: process.env.BLUESKY_USERNAME || '',
    password: process.env.BLUESKY_PASSWORD || '',
  });
  const rt = new RichText({
    text: tweetMessage,
  });

  // const imagePath = 'assets/logo.png';
  // const imageBuffer = fs.readFileSync(imagePath);

// // Upload the image
// const { data: uploadData } = await agent.uploadBlob(imageBuffer, { encoding: 'image/png' });

  await rt.detectFacets(agent);
  const postRecord = {
    $type: 'app.bsky.feed.post',
    text: rt.text,
    facets: rt.facets,
    // embed: {
    //        $type: 'app.bsky.embed.images',
    //        images: [
    //          {
    //            image: uploadData.blob,
    //           alt: 'Description of the image',
    //         },
    //        ],
    //     },
    createdAt: new Date().toISOString(),
  };  

  await agent.post(
   postRecord
  );
}

