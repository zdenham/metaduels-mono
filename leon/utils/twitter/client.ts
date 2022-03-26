require('dotenv').config();
import { TwitterApi } from 'twitter-api-v2';
const token = process.env.TWITTER_BEARER_TOKEN;
if (!token) {
  throw new Error('No Twitter Token Present');
}
const twitterClient = new TwitterApi(token);

export default twitterClient;
