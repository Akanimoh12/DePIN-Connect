import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy DePINRegistry
  const DePINRegistry = await ethers.getContractFactory("DePINRegistry");
  const dePINRegistry = await DePINRegistry.deploy();
  await dePINRegistry.waitForDeployment();
  console.log("DePINRegistry deployed to:", await dePINRegistry.getAddress());

  // Wrapped CRO (WCRO) on Cronos Testnet
  const paymentTokenAddress = "0x065de916325a42123921a27C49d079D41853120D"; 

  // Deploy PaymentStream
  const PaymentStream = await ethers.getContractFactory("PaymentStream");
  const paymentStream = await PaymentStream.deploy(paymentTokenAddress);
  await paymentStream.waitForDeployment();
  console.log("PaymentStream deployed to:", await paymentStream.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
