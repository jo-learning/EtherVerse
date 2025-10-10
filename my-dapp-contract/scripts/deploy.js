// scripts/deploy-simple.js
import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();
  

  const balance = await deployer.getBalance();
  

  
  const CustomerSign = await ethers.getContractFactory("CustomerSign");
  const customerSign = await CustomerSign.deploy();
  
  await customerSign.deployed();
  
  
  
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment error:", error);
    process.exit(1);
  });