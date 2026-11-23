
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { besu } from "../../keys";

async function main() {
    console.log("\n=== CARBON CREDIT TRANSACTION TEST ===");

    const provider = new ethers.JsonRpcProvider(
        besu.rpcnode.url
    );

    const wallet = new ethers.Wallet(
        besu.rpcnode.accountPrivateKey,
        provider
    );

    const contractAddress =
        "0xED2eBfC251Fa5AC29E2780f89328e99728D73195";

    const artifactPath = path.resolve(
        __dirname,
        "../../artifacts/contracts/CarbonCredit.sol/CarbonCredit.json"
    );

    const artifact = JSON.parse(
        fs.readFileSync(artifactPath, "utf8")
    );

    const contract: any = new ethers.Contract(
        contractAddress,
        artifact.abi,
        wallet
    );

    console.log("Wallet:", wallet.address);
    console.log("Contract:", contractAddress);

    // TEST 1: MINT 100 CARBON CREDITS

    console.log("\n=== MINTING 100 CC ===");

    const mintTx = await contract.mint(
        wallet.address,
        ethers.parseEther("100")
    );

    await mintTx.wait();

    console.log("Mint Transaction:", mintTx.hash);
    console.log("100 Carbon Credits Minted Successfully!");

    // TEST 2: RETIRE 10 CARBON CREDITS

    console.log("\n=== RETIRING 10 CC ===");

    const retireTx = await contract.retire(
        ethers.parseEther("10")
    );

    await retireTx.wait();

    console.log("Retire Transaction:", retireTx.hash);
    console.log("10 Carbon Credits Retired Successfully!");

    // VERIFY FINAL RESULTS

    console.log("\n=== FINAL CONTRACT STATUS ===");

    console.log(
        "Wallet Balance:",
        ethers.formatEther(
            await contract.balanceOf(wallet.address)
        )
    );

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

    console.log("\n=== TRANSACTION TEST COMPLETE ===");
}

main().catch((error) => {
    console.error("Transaction Test Failed:", error);
    process.exit(1);
});
