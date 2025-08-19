// scripts/deploy.js
import dotenv from "dotenv";
import hardhat from "hardhat";

dotenv.config();

const { ethers } = hardhat;

async function main() {
  const TokenSpender = await ethers.getContractFactory("TokenSpender");

  // deploy the contract
  const tokenSpender = await TokenSpender.deploy();

  // wait until the deployment transaction is mined
  await tokenSpender.deploymentTransaction().wait();

  console.log("TokenSpender deployed to:", tokenSpender.target); // .target replaces .address in ethers v6
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
