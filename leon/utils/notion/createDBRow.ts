require('dotenv').config();
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const createDBRow = async (
  discord: string,
  ethAddress: string,
  ethBalance: number,
  twitter: string
) => {
  return await notion.pages.create({
    parent: {
      database_id: '8d15c43fc2964c95905639c55750c1ce',
    },
    properties: {
      discord: {
        title: [
          {
            text: {
              content: discord,
            },
          },
        ],
      },
      eth_address: {
        rich_text: [
          {
            text: {
              content: ethAddress,
            },
          },
        ],
      },
      eth_balance: {
        number: ethBalance,
      },
      twitter: {
        url: twitter,
      },
    },
  });
};

export default createDBRow;
