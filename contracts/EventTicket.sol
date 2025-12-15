// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EventTicket is ERC721, AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    bytes32 public constant ORGANIZER_ROLE = keccak256("ORGANIZER_ROLE");
    
    enum EventStatus { Active, Cancelled, Postponed, Completed }
    enum RefundStatus { None, Requested, Approved, Refunded, Rejected }
    enum RefundMode { AutoRefund, BuyerClaim }
    
    struct Event {
        uint256 id;
        string name;
        string date;
        string time;
        string location;
        string city;
        string genre;
        uint256 maxTickets;
        uint256 ticketsRemaining;
        uint256 price;
        string imageUrl;
        address owner;
        EventStatus status;
        RefundMode refundMode;
        string description;
    }
    
    struct Ticket {
        uint256 tokenId;
        uint256 eventId;
        string seat;
        address owner;
        uint256 purchaseDate;
        uint256 price;
        RefundStatus refundStatus;
    }
    
    struct RefundRequest {
        uint256 id;
        uint256 eventId;
        address buyer;
        uint256 tokenId;
        uint256 amount;
        RefundStatus status;
        uint256 requestedAt;
        uint256 processedAt;
        string rejectionReason;
    }
    
    Counters.Counter private _eventIds;
    Counters.Counter private _tokenIds;
    Counters.Counter private _refundRequestIds;
    
    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => mapping(string => bool)) public seatTaken; // eventId => seat => taken
    mapping(uint256 => string[]) private _eventTakenSeats; // ADDED: Array to track taken seats for efficient fetching
    mapping(uint256 => mapping(address => uint256)) public ticketsPerWallet; // eventId => wallet => count
    mapping(uint256 => RefundRequest) public refundRequests;
    mapping(uint256 => uint256[]) public eventRefundRequests; // eventId => refundRequestIds
    mapping(uint256 => uint256) public eventWithdrawnAmount; // ADDED: Track withdrawn amounts per event
    
    uint256 public constant MAX_SEATS_PER_TRANSACTION = 1;
    uint256 public constant MAX_SEATS_PER_WALLET_PER_EVENT = 10;
    
    event EventCreated(
        uint256 indexed eventId,
        string name,
        address indexed owner,
        uint256 maxTickets,
        uint256 price
    );
    
    event TicketMinted(
        uint256 indexed tokenId,
        uint256 indexed eventId,
        address indexed buyer,
        string seat,
        uint256 price
    );
    
    event EventCancelled(
        uint256 indexed eventId,
        address indexed cancelledBy,
        RefundMode refundMode,
        uint256 timestamp
    );
    
    event RefundProcessed(
        uint256 indexed eventId,
        address indexed buyer,
        uint256 tokenId,
        uint256 amount
    );
    
    event RefundRequested(
        uint256 indexed requestId,
        uint256 indexed eventId,
        address indexed buyer,
        uint256 tokenId,
        uint256 amount
    );
    
    event RefundApproved(
        uint256 indexed requestId,
        uint256 indexed eventId,
        address indexed buyer
    );
    
    event RefundClaimed(
        uint256 indexed requestId,
        uint256 indexed eventId,
        address indexed buyer,
        uint256 amount
    );
    
    event EventUpdated(uint256 indexed eventId, EventStatus status);
    
    constructor() ERC721("EventChainTicket", "ECT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORGANIZER_ROLE, msg.sender);
    }
    
    // Create event (Admin/Organizer only)
    function createEvent(
        string memory _name,
        string memory _date,
        string memory _time,
        string memory _location,
        string memory _city,
        string memory _genre,
        uint256 _maxTickets,
        uint256 _price,
        string memory _imageUrl,
        string memory _description
    ) external onlyRole(ORGANIZER_ROLE) returns (uint256) {
        require(_maxTickets > 0 && _maxTickets <= 1000, "Invalid ticket count");
        require(_price > 0, "Price must be greater than 0");
        
        _eventIds.increment();
        uint256 newEventId = _eventIds.current();
        
        events[newEventId] = Event({
            id: newEventId,
            name: _name,
            date: _date,
            time: _time,
            location: _location,
            city: _city,
            genre: _genre,
            maxTickets: _maxTickets,
            ticketsRemaining: _maxTickets,
            price: _price,
            imageUrl: _imageUrl,
            owner: msg.sender,
            status: EventStatus.Active,
            refundMode: RefundMode.AutoRefund,
            description: _description
        });
        
        emit EventCreated(newEventId, _name, msg.sender, _maxTickets, _price);
        
        return newEventId;
    }
    
    // Mint ticket (purchase)
    function mint(uint256 _eventId, string memory _seat) 
        external 
        payable 
        nonReentrant 
        returns (uint256) 
    {
        Event storage evt = events[_eventId];
        
        require(evt.id != 0, "Event does not exist");
        require(evt.status == EventStatus.Active, "Event not active");
        require(evt.ticketsRemaining > 0, "Event sold out");
        require(!seatTaken[_eventId][_seat], "Seat already taken");
        require(msg.value == evt.price, "Incorrect payment amount");
        require(
            ticketsPerWallet[_eventId][msg.sender] < MAX_SEATS_PER_WALLET_PER_EVENT,
            "Max tickets per wallet reached"
        );
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);

        seatTaken[_eventId][_seat] = true;
        _eventTakenSeats[_eventId].push(_seat); // ADDED: Track seat in array for efficient fetching
        evt.ticketsRemaining--;
        ticketsPerWallet[_eventId][msg.sender]++;
        
        tickets[newTokenId] = Ticket({
            tokenId: newTokenId,
            eventId: _eventId,
            seat: _seat,
            owner: msg.sender,
            purchaseDate: block.timestamp,
            price: evt.price,
            refundStatus: RefundStatus.None
        });
        
        emit TicketMinted(newTokenId, _eventId, msg.sender, _seat, evt.price);
        
        return newTokenId;
    }
    
    // Cancel event (owner only)
    function cancelEvent(uint256 _eventId, RefundMode _refundMode) 
        external 
        nonReentrant 
    {
        Event storage evt = events[_eventId];
        
        require(evt.id != 0, "Event does not exist");
        require(evt.owner == msg.sender, "Only event owner can cancel");
        require(evt.status == EventStatus.Active, "Event not active");
        
        evt.status = EventStatus.Cancelled;
        evt.refundMode = _refundMode;
        
        emit EventCancelled(_eventId, msg.sender, _refundMode, block.timestamp);
        emit EventUpdated(_eventId, EventStatus.Cancelled);
        
        // Auto-refund: process refunds immediately
        if (_refundMode == RefundMode.AutoRefund) {
            _processAutoRefunds(_eventId);
        }
    }
    
    // Process auto-refunds (internal)
    function _processAutoRefunds(uint256 _eventId) internal {
        Event storage evt = events[_eventId];
        uint256 totalSupply = _tokenIds.current();
        
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_exists(i)) {
                Ticket storage ticket = tickets[i];
                
                if (ticket.eventId == _eventId && ticket.refundStatus == RefundStatus.None) {
                    address ticketOwner = ownerOf(i);
                    uint256 refundAmount = ticket.price;
                    
                    ticket.refundStatus = RefundStatus.Refunded;
                    
                    (bool success, ) = payable(ticketOwner).call{value: refundAmount}("");
                    require(success, "Refund transfer failed");
                    
                    emit RefundProcessed(_eventId, ticketOwner, i, refundAmount);
                }
            }
        }
    }
    
    // Request refund (buyer-claim mode)
    function requestRefund(uint256 _tokenId) external nonReentrant returns (uint256) {
        require(_exists(_tokenId), "Token does not exist");
        require(ownerOf(_tokenId) == msg.sender, "Not token owner");
        
        Ticket storage ticket = tickets[_tokenId];
        Event storage evt = events[ticket.eventId];
        
        require(evt.status == EventStatus.Cancelled, "Event not cancelled");
        require(evt.refundMode == RefundMode.BuyerClaim, "Not buyer-claim mode");
        require(ticket.refundStatus == RefundStatus.None, "Refund already processed");
        
        _refundRequestIds.increment();
        uint256 requestId = _refundRequestIds.current();
        
        refundRequests[requestId] = RefundRequest({
            id: requestId,
            eventId: ticket.eventId,
            buyer: msg.sender,
            tokenId: _tokenId,
            amount: ticket.price,
            status: RefundStatus.Requested,
            requestedAt: block.timestamp,
            processedAt: 0,
            rejectionReason: ""
        });
        
        eventRefundRequests[ticket.eventId].push(requestId);
        ticket.refundStatus = RefundStatus.Requested;
        
        emit RefundRequested(requestId, ticket.eventId, msg.sender, _tokenId, ticket.price);
        
        return requestId;
    }
    
    // Approve refund request (event owner only)
    function approveRefund(uint256 _requestId) external {
        RefundRequest storage request = refundRequests[_requestId];
        Event storage evt = events[request.eventId];
        
        require(request.id != 0, "Request does not exist");
        require(evt.owner == msg.sender, "Only event owner can approve");
        require(request.status == RefundStatus.Requested, "Invalid request status");
        
        request.status = RefundStatus.Approved;
        request.processedAt = block.timestamp;
        
        Ticket storage ticket = tickets[request.tokenId];
        ticket.refundStatus = RefundStatus.Approved;
        
        emit RefundApproved(_requestId, request.eventId, request.buyer);
    }
    
    // Reject refund request (event owner only)
    function rejectRefund(uint256 _requestId, string memory _reason) external {
        RefundRequest storage request = refundRequests[_requestId];
        Event storage evt = events[request.eventId];
        
        require(request.id != 0, "Request does not exist");
        require(evt.owner == msg.sender, "Only event owner can reject");
        require(request.status == RefundStatus.Requested, "Invalid request status");
        
        request.status = RefundStatus.Rejected;
        request.processedAt = block.timestamp;
        request.rejectionReason = _reason;
        
        Ticket storage ticket = tickets[request.tokenId];
        ticket.refundStatus = RefundStatus.Rejected;
    }
    
    // Claim approved refund (buyer)
    function claimRefund(uint256 _requestId) external nonReentrant {
        RefundRequest storage request = refundRequests[_requestId];
        
        require(request.id != 0, "Request does not exist");
        require(request.buyer == msg.sender, "Not request owner");
        require(request.status == RefundStatus.Approved, "Refund not approved");
        
        request.status = RefundStatus.Refunded;
        
        Ticket storage ticket = tickets[request.tokenId];
        ticket.refundStatus = RefundStatus.Refunded;
        
        (bool success, ) = payable(msg.sender).call{value: request.amount}("");
        require(success, "Refund transfer failed");
        
        emit RefundClaimed(_requestId, request.eventId, msg.sender, request.amount);
    }
    
    // FIXED: Withdraw funds (event owner) with proper balance tracking and 0 ETH prevention
    function withdraw(uint256 _eventId) external nonReentrant {
        Event storage evt = events[_eventId];
        require(evt.owner == msg.sender, "Only event owner can withdraw");

        // Calculate total lifetime revenue
        uint256 ticketsSold = evt.maxTickets - evt.ticketsRemaining;
        uint256 totalRevenue = ticketsSold * evt.price;

        // Calculate what is actually available to withdraw
        uint256 alreadyWithdrawn = eventWithdrawnAmount[_eventId];

        // Fix: Prevent 0 ETH transactions from being processed
        require(totalRevenue > alreadyWithdrawn, "No funds available to withdraw");

        uint256 amountToWithdraw = totalRevenue - alreadyWithdrawn;
        require(address(this).balance >= amountToWithdraw, "Contract underfunded");

        // EFFECTS: Update state BEFORE transfer to prevent re-entrancy/duplicates
        eventWithdrawnAmount[_eventId] += amountToWithdraw;

        // INTERACTION: External call last
        (bool success, ) = payable(msg.sender).call{value: amountToWithdraw}("");
        require(success, "Withdrawal failed");
    }
    
    // Grant organizer role (admin only)
    function grantOrganizerRole(address _organizer) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ORGANIZER_ROLE, _organizer);
    }
    
    // Get event details (renamed to avoid conflict with ethers.js getEvent)
    function getEventDetails(uint256 _eventId) external view returns (Event memory) {
        return events[_eventId];
    }
    
    // Get ticket details
    function getTicket(uint256 _tokenId) external view returns (Ticket memory) {
        return tickets[_tokenId];
    }
    
    // Get all events (paginated)
    function getEvents(uint256 _offset, uint256 _limit) 
        external 
        view 
        returns (Event[] memory) 
    {
        uint256 totalEvents = _eventIds.current();
        uint256 size = _limit;
        
        if (_offset + _limit > totalEvents) {
            size = totalEvents - _offset;
        }
        
        Event[] memory eventList = new Event[](size);
        
        for (uint256 i = 0; i < size; i++) {
            eventList[i] = events[_offset + i + 1];
        }
        
        return eventList;
    }
    
    // Get user tickets
    function getUserTickets(address _user) external view returns (Ticket[] memory) {
        uint256 balance = balanceOf(_user);
        Ticket[] memory userTickets = new Ticket[](balance);
        uint256 index = 0;
        
        uint256 totalSupply = _tokenIds.current();
        for (uint256 i = 1; i <= totalSupply; i++) {
            if (_exists(i) && ownerOf(i) == _user) {
                userTickets[index] = tickets[i];
                index++;
            }
        }
        
        return userTickets;
    }
    
    // Get event refund requests
    function getEventRefundRequests(uint256 _eventId) 
        external 
        view 
        returns (RefundRequest[] memory) 
    {
        uint256[] memory requestIds = eventRefundRequests[_eventId];
        RefundRequest[] memory requests = new RefundRequest[](requestIds.length);
        
        for (uint256 i = 0; i < requestIds.length; i++) {
            requests[i] = refundRequests[requestIds[i]];
        }
        
        return requests;
    }
    
    // Check seat availability
    function isSeatTaken(uint256 _eventId, string memory _seat)
        external
        view
        returns (bool)
    {
        return seatTaken[_eventId][_seat];
    }

    // ADDED: Get all taken seats for efficient frontend fetching
    function getTakenSeats(uint256 _eventId)
        external
        view
        returns (string[] memory)
    {
        return _eventTakenSeats[_eventId];
    }
    
    // Get total events
    function getTotalEvents() external view returns (uint256) {
        return _eventIds.current();
    }
    
    // Required overrides
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}