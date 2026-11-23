import express from "express";
import cors from "cors";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { besu } from "../../keys";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const CONTRACT_ADDRESS = "0xED2eBfC251Fa5AC29E2780f89328e99728D73195";

const provider = new ethers.JsonRpcProvider(besu.rpcnode.url);
const wallet = new ethers.Wallet(besu.rpcnode.accountPrivateKey, provider);

const artifactPath = path.resolve(
  __dirname,
  "../../artifacts/contracts/CarbonCredit.sol/CarbonCredit.json"
);
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  artifact.abi,
  wallet
);

app.get("/api/health", async (_req, res) => {
  try {
    const network = await provider.getNetwork();
    res.json({
      status: "online",
      blockchain: "Hyperledger Besu",
      chainId: network.chainId.toString(),
      wallet: wallet.address
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/credits", async (req, res) => {
  try {
    const address = String(req.query.address || wallet.address);

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const [name, symbol, balance, totalSupply, totalIssued, totalRetired, owner] =
      await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.balanceOf(address),
        contract.totalSupply(),
        contract.totalIssued(),
        contract.totalRetired(),
        contract.owner()
      ]);

    res.json({
      name,
      symbol,
      address,
      balance: ethers.formatEther(balance),
      totalSupply: ethers.formatEther(totalSupply),
      totalIssued: ethers.formatEther(totalIssued),
      totalRetired: ethers.formatEther(totalRetired),
      contractAddress: CONTRACT_ADDRESS,
      owner
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/credits/issue", async (req, res) => {
  try {
    const { to, amount } = req.body;

    if (!ethers.isAddress(to) || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Provide a valid recipient and positive amount" });
    }

    const tx = await contract.mint(to, ethers.parseEther(String(amount)));
    const receipt = await tx.wait();

    res.json({
      message: "Carbon credits issued successfully",
      recipient: to,
      amount: String(amount),
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    });
  } catch (error: any) {
    res.status(500).json({ error: error.shortMessage || error.message });
  }
});

app.post("/api/credits/retire", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Provide a positive amount" });
    }

    const tx = await contract.retire(ethers.parseEther(String(amount)));
    const receipt = await tx.wait();

    res.json({
      message: "Carbon credits retired successfully",
      amount: String(amount),
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    });
  } catch (error: any) {
    res.status(500).json({ error: error.shortMessage || error.message });
  }
});


app.get("/api/transactions", async (_req, res) => {
  try {
    const [issuedLogs, retiredLogs] = await Promise.all([
      contract.queryFilter(contract.filters.CreditsIssued(), 0, "latest"),
      contract.queryFilter(contract.filters.CreditsRetired(), 0, "latest")
    ]);

    const records = await Promise.all([
      ...issuedLogs.map(async (log: any) => {
        const block = await provider.getBlock(log.blockNumber);
        return {
          id: log.transactionHash,
          transactionHash: log.transactionHash,
          type: "Credit issuance",
          detail: `Credits issued to ${log.args.recipient}`,
          amount: `+${ethers.formatEther(log.args.amount)}`,
          date: block ? new Date(Number(block.timestamp) * 1000).toISOString() : null,
          blockNumber: log.blockNumber,
          status: "Confirmed"
        };
      }),
      ...retiredLogs.map(async (log: any) => {
        const block = await provider.getBlock(log.blockNumber);
        return {
          id: log.transactionHash,
          transactionHash: log.transactionHash,
          type: "Credit retirement",
          detail: `Credits retired by ${log.args.account}`,
          amount: `-${ethers.formatEther(log.args.amount)}`,
          date: block ? new Date(Number(block.timestamp) * 1000).toISOString() : null,
          blockNumber: log.blockNumber,
          status: "Confirmed"
        };
      })
    ]);

    records.sort((a, b) => b.blockNumber - a.blockNumber);
    res.json({ transactions: records });
  } catch (error: any) {
    res.status(500).json({ error: error.shortMessage || error.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Carbon Credit API running at http://localhost:${PORT}`);
  console.log(`Connected wallet: ${wallet.address}`);
  console.log(`Contract: ${CONTRACT_ADDRESS}`);
});
