import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying EventTicket contract...");

  // Get deployer and check balance
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    throw new Error("❌ No ETH in wallet! Get Sepolia ETH from a faucet first: https://sepoliafaucet.com or https://faucet.quicknode.com/ethereum/sepolia");
  }

  // Deploy contract
  const EventTicket = await ethers.getContractFactory("EventTicket");
  const eventTicket = await EventTicket.deploy();
  await eventTicket.waitForDeployment();

  const contractAddress = await eventTicket.getAddress();
  console.log(`✅ EventTicket deployed to: ${contractAddress}`);


  // Export contract address and ABI
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    contractAddress: contractAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "../frontend/src/deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "EventTicket.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Copy ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/EventTicket.sol/EventTicket.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  fs.writeFileSync(
    path.join(deploymentsDir, "EventTicket-abi.json"),
    JSON.stringify(artifact.abi, null, 2)
  );

  console.log("\n✅ Deployment complete!");
  console.log(`📄 Contract address: ${contractAddress}`);
  console.log(`📁 Deployment files saved to: ${deploymentsDir}`);
  console.log(`🔍 Verify on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log(`🔧 To verify contract: npx hardhat verify --network sepolia ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });