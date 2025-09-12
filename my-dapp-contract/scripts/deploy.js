// scripts/deploy-simple.js
import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

  console.log("Deploying CustomerSign contract...");
  const CustomerSign = await ethers.getContractFactory("CustomerSign");
  const customerSign = await CustomerSign.deploy();
  
  await customerSign.deployed();
  
  console.log("✅ Contract deployed to:", customerSign.address);
  console.log("📋 Copy this address for your frontend:", customerSign.address);
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId + ")");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment error:", error);
    process.exit(1);
  });