# Setting up Multi-Player Game Testing

- You will need **two** separate chrome browser instances with metamask installed
- The easiest way to accomplish this is by creating a second chrome profile and installing metamask again
- You will need to add hardhat network to your metamask on both profiles
- Select networks -> add network from the metamask pop up
- Then enter the below details to add hardhat network
  ![hardhat network](https://i.imgur.com/j4EynIF.png)
- Add a `.env` file in game/ directory with the following contents

```
LOCAL_OWNER_PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
TESTER_1=<your tester 1 eth address>
TESTER_2=<your tester 2 eth address>
```

# Running the Game!

1. From the `game` directory `npm install`
2. Run `npm run local-node` to start the local hardhat network
3. Run `npm run local-deploy` to deploy the local game smart contract
4. from the `web` directory run `npm install`
5. Run `npm start`
6. Open the game on http://localhost:3001/game.html
7. Create a new game by copying the tester_2 address and challenging them from tester_1 browser
8. Make sure to check out index.js "For Debugging" section
