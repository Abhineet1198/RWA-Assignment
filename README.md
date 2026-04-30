# Minimal RWA Tokenisation Flow

## Overview

This project demonstrates a simplified **Real World Asset (RWA) Tokenisation system** built using:

* **Solidity Smart Contracts (Hardhat)**
* **Node.js (JavaScript, ES Modules) Backend**
* **MongoDB (Mongoose) for persistence**
* **Ethers.js for blockchain interaction**

The system allows users to deposit ETH (or mock value) into a treasury and receive **ERC20 tokens representing fractional ownership**.

---

## Architecture

```
User → Backend API → Smart Contract (Treasury)
                      ↓
                Emits Events (Deposited)
                      ↓
        WebSocket Listener (Backend)
                      ↓
              MongoDB (Persistent Storage)
                      ↓
                API Response
```

---

## Approach

### 1. Smart Contracts

#### ERC20 Token Contract

* Represents fractional ownership of real-world assets
* Minted when users deposit into treasury

#### Treasury Contract

* Accepts deposits (ETH/mock)
* Mints tokens to users
* Emits `Deposited` event
* Owner-controlled withdrawals (access control)

---

### 2. Backend (Node.js)

#### Event-Driven Architecture (Production Approach)

Instead of inefficient polling, the backend uses:

### 🔹 Initial Sync (Historical Data)

* Fetches past events using `queryFilter`
* Uses **chunked block range** to avoid RPC limits

### 🔹 WebSocket Listener (Real-Time)

* Listens to `Deposited` events using WebSocket
* Captures new transactions instantly

### 🔹 MongoDB Persistence

* Stores all transactions in database
* Prevents data loss on restart
* Enables efficient querying and pagination

---

### 3. Database Design

Transactions are stored with:

* Unique `txHash` (prevents duplicates)
* Indexed `blockNumber` (pagination)
* Indexed `user` (user history queries)

---

### 4. API Layer

#### Get Transaction History

* Fetches transactions from MongoDB
* Supports pagination (`limit`, `offset`)
* Sorted by latest block

#### Get Wallet Balance

* Reads ERC20 balance using `ethers.js`

#### Deposit Preview

* Calculates expected tokens based on deposit amount

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/Abhineet1198/RWA-Assignment.git
cd RWA-Assignment/backend
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Setup Environment Variables

Create `.env` file:

``` backend env
PORT=5000

# Blockchain
RPC_URL= rpc_url of testnet evm based blockchain

# Contracts
TREASURY_ADDRESS=0x6898bCb62a6562d8B8c36258E227AF6aCEb2EA84
TOKEN_ADDRESS=0x761Ffc65DCF3Ea5F43ED1ea5e2C51a67cd20D05B

# Wallet (optional for tx signing)
PRIVATE_KEY=your_private_key

# Database
MONGO_URI=mongodb://127.0.0.1:27017/rwa-token
```

---

### 4. Run Backend

```bash
npm run dev
```

Server runs at:

```
http://localhost:5000
```

---

### 5. Smart Contract Commands (Hardhat)

```bash
npx hardhat compile
npx hardhat test
npx hardhat node

# Deploy contract
npx hardhat run scripts/deploy.js --network binanceTestnet
```

---

##  API Endpoints

### 1. Get Transactions

```http
GET /api/transactions?limit=10&offset=0
```

**Response:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "user": "0x...",
      "ethAmount": "1",
      "tokensMinted": "100",
      "txHash": "0x...",
      "blockNumber": 123456
    }
  ]
}
```

---

### 2. Get Wallet Balance

```http
GET /api/balance/:address
```

---

### 3. Deposit Preview

```http
POST /api/deposit-preview
```

**Body:**

```json
{
  "amount": "1"
}
```

---

## 🧪 Testing

Test cases implemented:

* Deposit flow
* Withdrawal flow
* Unauthorized access (edge case)

Run tests:

```bash
npx hardhat test
```

---

## 🔐 Key Features

* ✅ Event-driven architecture (WebSocket)
* ✅ MongoDB persistence (no data loss)
* ✅ Initial sync + real-time updates
* ✅ No duplicate transactions (unique txHash)
* ✅ Pagination support
* ✅ Scalable backend design

---

## ⚠️ Limitations

* Uses public RPC (rate limits possible)
* No retry queue for failed DB writes
* Not horizontally scaled (single instance)

---

## 🔥 Future Improvements

* Add **Redis caching**
* Implement **WebSocket + HTTP fallback**
* Add **Swagger API documentation**
* Add **queue system (BullMQ/Kafka)**
* Migrate to **PostgreSQL for financial-grade systems**

---

## 📄 Deployed Contracts

* Treasury: `0x6898bCb62a6562d8B8c36258E227AF6aCEb2EA84`
* Token: `0x...`

---

## 👨‍💻 Author

Abhineet Kumar
Blockchain & Backend Developer

---

## ✅ Conclusion

This project demonstrates a **production-ready RWA tokenisation flow** using:

* Event-driven blockchain integration
* Persistent storage with MongoDB
* Scalable backend architecture

It ensures **real-time updates, data consistency, and efficient querying**, aligning with real-world backend system design.
