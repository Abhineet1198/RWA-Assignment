const hre = require("hardhat");
const { ethers } = require("hardhat");
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const { saveContractAddress } = require("./utils");

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function contractDeploy() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // =========================
  // 1. Deploy RWAToken
  // =========================
  const Token = await ethers.getContractFactory("RWAToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  console.log("Waiting for confirmations...");
  await token.deploymentTransaction().wait(2);

  const tokenAddress = await token.getAddress();
  console.log("RWAToken deployed at:", tokenAddress);

  saveContractAddress("RWAToken", tokenAddress);

  // =========================
  // 2. Deploy Treasury
  // =========================
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(tokenAddress, 100); // rate = 100
  await treasury.waitForDeployment();

  await treasury.deploymentTransaction().wait(2);

  const treasuryAddress = await treasury.getAddress();
  console.log("Treasury deployed at:", treasuryAddress);

  saveContractAddress("Treasury", treasuryAddress);

  // =========================
  // 3. Link Treasury → Token
  // =========================
  console.log("Linking Treasury with Token...");
  const tx = await token.setTreasury(treasuryAddress);
  await tx.wait();

  console.log("Treasury linked successfully");

  // =========================
  // 4. Verify (Testnet only)
  // =========================
  if (hre.network.config.chainId === 97) {
    console.log("Waiting before verification...");
    await wait(15000);

    console.log("Verifying RWAToken...");
    await hre.run("verify:verify", {
      address: tokenAddress,
      constructorArguments: [],
    });

    console.log("Verifying Treasury...");
    await hre.run("verify:verify", {
      address: treasuryAddress,
      constructorArguments: [tokenAddress, 100],
    });
  }

  console.log("\nDeployment Complete");
  console.log("RWAToken:", tokenAddress);
  console.log("Treasury:", treasuryAddress);
}

contractDeploy().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});