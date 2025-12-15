import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Debugging Event Status...\n");

  // Get contract
  const EventTicket = await ethers.getContractFactory("EventTicket");
  const contract = await EventTicket.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

  console.log(`📄 Contract Address: ${await contract.getAddress()}\n`);

  // Get total events
  const totalEvents = await (contract as any).getTotalEvents();
  console.log(`📊 Total Events: ${totalEvents}\n`);

  if (totalEvents === 0n) {
    console.log("❌ No events found. Create an event first in the Admin Panel.");
    return;
  }

  // Check each event
  for (let i = 1; i <= Number(totalEvents); i++) {
    console.log(`--- Event ${i} ---`);

    try {
      const event = await (contract as any).getEventDetails(i);

      console.log(`Name: ${event.name}`);
      console.log(`ID: ${event.id}`);
      console.log(`Owner: ${event.owner}`);
      console.log(`Max Tickets: ${event.maxTickets}`);
      console.log(`Tickets Remaining: ${event.ticketsRemaining}`);
      console.log(`Price: ${ethers.formatEther(event.price)} ETH`);
      console.log(`Status: ${event.status} ${event.status === 0n ? 'Active ✅' : event.status === 1n ? 'Cancelled ❌' : event.status === 2n ? 'Postponed ⚠️' : 'Completed ✅'}`);
      console.log(`Refund Mode: ${event.refundMode}`);

      // Check if can purchase
      const canPurchase = event.status === 0n && event.ticketsRemaining > 0n;
      console.log(`✅ Can Purchase: ${canPurchase ? 'YES ✅' : 'NO ❌'}`);

      if (event.status !== 0n) {
        console.log(`⚠️  Event status is not Active! Status: ${event.status}`);
      }

      console.log("");

    } catch (error) {
      console.error(`Error getting event ${i}:`, error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });