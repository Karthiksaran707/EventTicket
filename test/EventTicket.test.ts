import "@nomicfoundation/hardhat-chai-matchers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { EventTicket } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("EventTicket", function () {
  let eventTicket: EventTicket;
  let owner: SignerWithAddress;
  let organizer: SignerWithAddress;
  let buyer1: SignerWithAddress;
  let buyer2: SignerWithAddress;

  beforeEach(async function () {
    [owner, organizer, buyer1, buyer2] = await ethers.getSigners();

    const EventTicket = await ethers.getContractFactory("EventTicket");
    eventTicket = await EventTicket.deploy();
    await eventTicket.waitForDeployment();

    // Grant organizer role
    const ORGANIZER_ROLE = await eventTicket.ORGANIZER_ROLE();
    await eventTicket.grantRole(ORGANIZER_ROLE, organizer.address);
  });

  describe("Event Creation", function () {
    it("Should create an event successfully", async function () {
      const tx = await eventTicket.connect(organizer).createEvent(
        "Test Event",
        "2025-12-31",
        "20:00",
        "Test Location",
        "Test City",
        "Music",
        100,
        ethers.parseEther("0.05"),
        "https://example.com/image.jpg",
        "Test description"
      );

      await expect(tx).to.emit(eventTicket, "EventCreated");

      const event = await eventTicket.getEventDetails(1);
      expect(event.name).to.equal("Test Event");
      expect(event.maxTickets).to.equal(100);
      expect(event.ticketsRemaining).to.equal(100);
    });

    it("Should fail when non-organizer tries to create event", async function () {
      await expect(
        eventTicket.connect(buyer1).createEvent(
          "Test Event",
          "2025-12-31",
          "20:00",
          "Test Location",
          "Test City",
          "Music",
          100,
          ethers.parseEther("0.05"),
          "https://example.com/image.jpg",
          "Test description"
        )
      ).to.be.reverted;
    });

    it("Should fail with invalid ticket count", async function () {
      await expect(
        eventTicket.connect(organizer).createEvent(
          "Test Event",
          "2025-12-31",
          "20:00",
          "Test Location",
          "Test City",
          "Music",
          0,
          ethers.parseEther("0.05"),
          "https://example.com/image.jpg",
          "Test description"
        )
      ).to.be.revertedWith("Invalid ticket count");
    });
  });

  describe("Ticket Minting", function () {
    beforeEach(async function () {
      await eventTicket.connect(organizer).createEvent(
        "Test Event",
        "2025-12-31",
        "20:00",
        "Test Location",
        "Test City",
        "Music",
        100,
        ethers.parseEther("0.05"),
        "https://example.com/image.jpg",
        "Test description"
      );
    });

    it("Should mint a ticket successfully", async function () {
      const tx = await eventTicket.connect(buyer1).mint(1, "A1", {
        value: ethers.parseEther("0.05")
      });

      await expect(tx).to.emit(eventTicket, "TicketMinted");

      const ticket = await eventTicket.getTicket(1);
      expect(ticket.eventId).to.equal(1);
      expect(ticket.seat).to.equal("A1");
      expect(ticket.owner).to.equal(buyer1.address);

      const isTaken = await eventTicket.isSeatTaken(1, "A1");
      expect(isTaken).to.be.true;
    });

    it("Should fail when seat is already taken", async function () {
      await eventTicket.connect(buyer1).mint(1, "A1", {
        value: ethers.parseEther("0.05")
      });

      await expect(
        eventTicket.connect(buyer2).mint(1, "A1", {
          value: ethers.parseEther("0.05")
        })
      ).to.be.revertedWith("Seat already taken");
    });

    it("Should fail with incorrect payment", async function () {
      await expect(
        eventTicket.connect(buyer1).mint(1, "A1", {
          value: ethers.parseEther("0.04")
        })
      ).to.be.revertedWith("Incorrect payment amount");
    });

    it("Should track tickets per wallet", async function () {
      await eventTicket.connect(buyer1).mint(1, "A1", {
        value: ethers.parseEther("0.05")
      });
      await eventTicket.connect(buyer1).mint(1, "A2", {
        value: ethers.parseEther("0.05")
      });

      const event = await eventTicket.getEventDetails(1);
      expect(event.ticketsRemaining).to.equal(98);
    });
  });

  describe("Event Cancellation", function () {
    beforeEach(async function () {
      await eventTicket.connect(organizer).createEvent(
        "Test Event",
        "2025-12-31",
        "20:00",
        "Test Location",
        "Test City",
        "Music",
        100,
        ethers.parseEther("0.05"),
        "https://example.com/image.jpg",
        "Test description"
      );

      // Mint some tickets
      await eventTicket.connect(buyer1).mint(1, "A1", {
        value: ethers.parseEther("0.05")
      });
      await eventTicket.connect(buyer2).mint(1, "A2", {
        value: ethers.parseEther("0.05")
      });
    });

    it("Should cancel event with auto-refund", async function () {
      const buyer1BalanceBefore = await ethers.provider.getBalance(buyer1.address);
      const buyer2BalanceBefore = await ethers.provider.getBalance(buyer2.address);

      const tx = await eventTicket.connect(organizer).cancelEvent(1, 0); // 0 = AutoRefund
      await expect(tx).to.emit(eventTicket, "EventCancelled");

      const event = await eventTicket.getEventDetails(1);
      expect(event.status).to.equal(1); // Cancelled

      // Check refunds processed
      const buyer1BalanceAfter = await ethers.provider.getBalance(buyer1.address);
      const buyer2BalanceAfter = await ethers.provider.getBalance(buyer2.address);

      expect(buyer1BalanceAfter).to.be.gt(buyer1BalanceBefore);
      expect(buyer2BalanceAfter).to.be.gt(buyer2BalanceBefore);
    });

    it("Should fail when non-owner tries to cancel", async function () {
      await expect(
        eventTicket.connect(buyer1).cancelEvent(1, 0)
      ).to.be.revertedWith("Only event owner can cancel");
    });

    it("Should set buyer-claim refund mode", async function () {
      await eventTicket.connect(organizer).cancelEvent(1, 1); // 1 = BuyerClaim

      const event = await eventTicket.getEventDetails(1);
      expect(event.refundMode).to.equal(1);
    });
  });

  describe("Refund Requests (Buyer-Claim)", function () {
    beforeEach(async function () {
      await eventTicket.connect(organizer).createEvent(
        "Test Event",
        "2025-12-31",
        "20:00",
        "Test Location",
        "Test City",
        "Music",
        100,
        ethers.parseEther("0.05"),
        "https://example.com/image.jpg",
        "Test description"
      );

      await eventTicket.connect(buyer1).mint(1, "A1", {
        value: ethers.parseEther("0.05")
      });

      await eventTicket.connect(organizer).cancelEvent(1, 1); // BuyerClaim mode
    });

    it("Should request refund successfully", async function () {
      const tx = await eventTicket.connect(buyer1).requestRefund(1);
      await expect(tx).to.emit(eventTicket, "RefundRequested");

      const ticket = await eventTicket.getTicket(1);
      expect(ticket.refundStatus).to.equal(1); // Requested
    });

    it("Should approve refund request", async function () {
      await eventTicket.connect(buyer1).requestRefund(1);

      const tx = await eventTicket.connect(organizer).approveRefund(1);
      await expect(tx).to.emit(eventTicket, "RefundApproved");

      const request = await eventTicket.refundRequests(1);
      expect(request.status).to.equal(2); // Approved
    });

    it("Should claim approved refund", async function () {
      await eventTicket.connect(buyer1).requestRefund(1);
      await eventTicket.connect(organizer).approveRefund(1);

      const balanceBefore = await ethers.provider.getBalance(buyer1.address);

      const tx = await eventTicket.connect(buyer1).claimRefund(1);
      await expect(tx).to.emit(eventTicket, "RefundClaimed");

      const balanceAfter = await ethers.provider.getBalance(buyer1.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should reject refund request", async function () {
      await eventTicket.connect(buyer1).requestRefund(1);

      await eventTicket.connect(organizer).rejectRefund(1, "Event not cancelled");

      const request = await eventTicket.refundRequests(1);
      expect(request.status).to.equal(4); // Rejected
      expect(request.rejectionReason).to.equal("Event not cancelled");
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      await eventTicket.connect(organizer).createEvent(
        "Test Event",
        "2025-12-31",
        "20:00",
        "Test Location",
        "Test City",
        "Music",
        100,
        ethers.parseEther("0.05"),
        "https://example.com/image.jpg",
        "Test description"
      );

      await eventTicket.connect(buyer1).mint(1, "A1", {
        value: ethers.parseEther("0.05")
      });
      await eventTicket.connect(buyer2).mint(1, "A2", {
        value: ethers.parseEther("0.05")
      });
    });

    it("Should allow event owner to withdraw funds", async function () {
      const balanceBefore = await ethers.provider.getBalance(organizer.address);

      const tx = await eventTicket.connect(organizer).withdraw(1);
      await tx.wait();

      const balanceAfter = await ethers.provider.getBalance(organizer.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should fail when non-owner tries to withdraw", async function () {
      await expect(
        eventTicket.connect(buyer1).withdraw(1)
      ).to.be.revertedWith("Only event owner can withdraw");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      for (let i = 0; i < 3; i++) {
        await eventTicket.connect(organizer).createEvent(
          `Event ${i + 1}`,
          "2025-12-31",
          "20:00",
          "Test Location",
          "Test City",
          "Music",
          100,
          ethers.parseEther("0.05"),
          "https://example.com/image.jpg",
          "Test description"
        );
      }
    });

    it("Should get paginated events", async function () {
      const events = await eventTicket.getEvents(0, 2);
      expect(events.length).to.equal(2);
      expect(events[0].name).to.equal("Event 1");
    });

    it("Should get user tickets", async function () {
      await eventTicket.connect(buyer1).mint(1, "A1", {
        value: ethers.parseEther("0.05")
      });
      await eventTicket.connect(buyer1).mint(2, "B1", {
        value: ethers.parseEther("0.05")
      });

      const tickets = await eventTicket.getUserTickets(buyer1.address);
      expect(tickets.length).to.equal(2);
    });

    it("Should get total events", async function () {
      const total = await eventTicket.getTotalEvents();
      expect(total).to.equal(3);
    });
  });
});
