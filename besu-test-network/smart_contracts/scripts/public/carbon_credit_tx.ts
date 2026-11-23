
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { besu } from "../../keys";

async function main() {
    console.log("\n=== CARBON CREDIT DEPLOYMENT ===");

    const provider = new ethers.JsonRpcProvider(
        besu.rpcnode.url
    );

    const wallet = new ethers.Wallet(
        besu.rpcnode.accountPrivateKey,
        provider
    );

    console.log("Deployer:", wallet.address);

    const balance = await provider.getBalance(wallet.address);

    console.log("ETH Balance:", ethers.formatEther(balance));

    if (balance === 0n) {
        throw new Error("Deployer has no ETH for gas.");
    }

    const artifactPath = path.resolve(
        __dirname,
        "../../artifacts/contracts/CarbonCredit.sol/CarbonCredit.json"
    );

    const artifact = JSON.parse(
        fs.readFileSync(artifactPath, "utf8")
    );

    const factory = new ethers.ContractFactory(
        artifact.abi,
        artifact.bytecode,
        wallet
    );

    console.log("\nDeploying CarbonCredit contract...");

    const contract: any = await factory.deploy();

    await contract.waitForDeployment();

    const address = await contract.getAddress();

    console.log("Contract deployed at:", address);

    console.log("\n=== CONTRACT INFORMATION ===");

    console.log("Name:", await contract.name());
    console.log("Symbol:", await contract.symbol());
    console.log("Owner:", await contract.owner());

    console.log(
        "Total Supply:",
        ethers.formatEther(await contract.totalSupply())
    );

    console.log(
        "Total Issued:",
        ethers.formatEther(await contract.totalIssued())
    );

    console.log(
        "Total Retired:",
        ethers.formatEther(await contract.totalRetired())
    );

    console.log("\n=== DEPLOYMENT COMPLETE ===");
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
