import { network } from "hardhat";

const { ethers } = await network.connect();

const [deployer] = await ethers.getSigners();

console.log("Deploying Khan_SupplyChain with:", deployer.address);

const supplyChain = await ethers.deployContract("Khan_SupplyChain");
await supplyChain.waitForDeployment();

console.log("Khan_SupplyChain deployed to:", await supplyChain.getAddress());
