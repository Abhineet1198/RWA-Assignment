require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env"});


task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      }    
    }
  },
  networks: {
    binanceTestnet: {
      url: process.env.RPC_URL || "https://bsc-testnet.infura.io/v3/5fbcee284d2d48baa3b1f2ee0090a160",
      chainId: 97,
      gasPrice: "auto",   // 25000000000
      gas : "auto",             //  8000000
      accounts: [process.env.PRIVATE_KEY]
    },
    
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: `${process.env?.ETHERSCAN_API_KEY}`
  },
  mocha: {
    timeout: 20000,
  },
};