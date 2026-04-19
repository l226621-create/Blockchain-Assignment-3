import { network } from "hardhat";

const { ethers } = await network.connect();

const [deployer] = await ethers.getSigners();

console.log("Deploying MUSTAFA SAJID BLOCKCHAIN with:", deployer.address);

const supplyChain = await ethers.deployContract("MustafaSajidBlockchain");
await supplyChain.waitForDeployment();

console.log("MUSTAFA SAJID BLOCKCHAIN deployed to:", await supplyChain.getAddress());
