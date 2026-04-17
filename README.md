# Khan Supply Chain Management DApp

This project is a supply chain management DApp built for Polygon Amoy using Solidity, Hardhat, Ethers.js, and a simple HTML/CSS/JavaScript frontend.

It tracks products through the required assignment flow:

Manufacturer -> Distributor -> Retailer -> Customer

## Features

- Role-based smart contract for Manufacturer, Distributor, Retailer, and Customer
- Manufacturer-only product registration
- Ownership transfer validation across the supply chain
- Product audit trail with timestamps
- Hardhat deployment script for Polygon Amoy
- Simple frontend with MetaMask integration

## Project Files

- Contract: `contracts/Khan_supplychain.sol`
- Deployment script: `scripts/deploy.ts`
- Frontend: `frontend/`
- Hardhat config: `hardhat.config.ts`

## Deployed Contract

- Network: Polygon Amoy
- Contract address: `0x9c017B499927f63b487CD15F7fCD430A0C4Df4BB`

## Environment Variables

Create a `.env` file in the project root:

```env
AMOY_RPC_URL="https://rpc-amoy.polygon.technology"
PRIVATE_KEY="0xYOUR_PRIVATE_KEY"
POLYGONSCAN_API_KEY="YOUR_POLYGONSCAN_API_KEY"
```

The `.env` file is already ignored in `.gitignore`, so it should not be pushed to GitHub.

## Install Dependencies

```bash
npm install
```

## Compile

```bash
npm run compile
```

## Deploy to Polygon Amoy

```bash
npm run deploy:amoy
```

## Run the Frontend

```bash
npm run frontend
```

Then open `http://localhost:8080`.

## Frontend Functions

The frontend allows you to:

- connect MetaMask
- switch to Polygon Amoy
- assign roles
- register new products
- transfer ownership
- view product details
- view product history

## Suggested Demo Steps

1. Connect MetaMask.
2. Switch to Polygon Amoy.
3. Assign roles to test wallet addresses.
4. Register a product as a manufacturer.
5. Transfer it to a distributor.
6. Transfer it to a retailer.
7. Transfer it to a customer.
8. Load the product by ID and show the audit trail.

## Notes

- MetaMask is required for wallet-based actions.
- The deploying wallet needs Amoy test tokens for gas.
- Do not reuse exposed private keys on mainnet or for real funds.
