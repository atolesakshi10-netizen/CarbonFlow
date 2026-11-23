import { ethers } from "ethers";
import { besu } from "../../keys";
import artifact from "../../artifacts/contracts/CarbonCredit.sol/CarbonCredit.json";

async function main() {

    console.log("\n=== CARBON CREDIT VERIFICATION ===");

    const provider = new ethers.JsonRpcProvider(
        besu.rpcnode.url
    );

    const contractAddress =
        "0x49f8866d90ffDa8B12AC5677966e963acEc6d80E";

    const contract = new ethers.Contract(
        contractAddress,
        artifact.abi,
        provider
    );

    console.log("\n=== CONTRACT DETAILS ===");

    console.log("Name:", await contract.name());
    console.log("Symbol:", await contract.symbol());

    console.log("\n=== BLOCKCHAIN STATE ===");

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

    console.log("\n=== TRANSACTION EVENTS ===");

    const issuedEvents =
        await contract.queryFilter(contract.filters.CreditsIssued());

    const retiredEvents =
        await contract.queryFilter(contract.filters.CreditsRetired());

    console.log("Credits Issued Events:", issuedEvents.length);
    console.log("Credits Retired Events:", retiredEvents.length);

    console.log("\n=== VERIFICATION COMPLETE ===");
}

main().catch(console.error);
