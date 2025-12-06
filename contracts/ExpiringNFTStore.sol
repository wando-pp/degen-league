// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ExpiringNFTStore {
    address public owner;

    uint256 public minimumBuyPrice = 0.00001 ether;
    uint256 public minimumRentPrice = 0.000007 ether;
    uint256 public transferFee = 0.000007 ether;

    // itemId => owner (0 = minted but unsold)
    mapping(uint256 => address) public itemOwner;

    // itemId => minted?
    mapping(uint256 => bool) public isMinted;

    // itemId → expiration timestamp
    mapping(uint256 => uint256) public itemExpiry;

    // user → owned items
    mapping(address => uint256[]) public ownedItems;

    // itemId => renters (list)
    mapping(uint256 => address[]) public renters;

    // itemId => rent price (if owner wants custom price)
    mapping(uint256 => uint256) public rentPrice;

    event ItemMinted(uint256 indexed itemId, uint256 expiryTimestamp);
    event ItemBought(
        address indexed buyer,
        uint256 indexed itemId,
        uint256 amount
    );
    event ItemTransferred(
        address indexed from,
        address indexed to,
        uint256 indexed itemId,
        uint256 feePaid
    );
    event ItemRented(
        address indexed renter,
        uint256 indexed itemId,
        uint256 rentAmount
    );
    event MinimumBuyPriceUpdated(uint256 newPrice);
    event MinimumRentPriceUpdated(uint256 newRentPrice);
    event TransferFeeUpdated(uint256 newFee);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    constructor() {
        owner = 0xc58F0E2007B4c52597042cB212a3683AF2ABDA06;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier notExpired(uint256 itemId) {
        require(block.timestamp < itemExpiry[itemId], "Item has expired");
        _;
    }

    // ------------------------------
    // ADMIN FUNCTIONS
    // ------------------------------

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        address previous = owner;
        owner = newOwner;
        emit OwnershipTransferred(previous, newOwner);
    }

    // Mint with expiry
    function mintItem(
        uint256 itemId,
        uint256 expiryTimestamp
    ) external onlyOwner {
        require(!isMinted[itemId], "Already minted");
        require(expiryTimestamp > block.timestamp, "Expiry must be future");

        isMinted[itemId] = true;
        itemOwner[itemId] = address(0);
        itemExpiry[itemId] = expiryTimestamp;

        emit ItemMinted(itemId, expiryTimestamp);
    }

    function updateMinimumBuyPrice(uint256 newPrice) external onlyOwner {
        minimumBuyPrice = newPrice;
        emit MinimumBuyPriceUpdated(newPrice);
    }

    function updateMinimumRentPrice(uint256 newRentPrice) external onlyOwner {
        minimumRentPrice = newRentPrice;
        emit MinimumRentPriceUpdated(newRentPrice);
    }

    function updateTransferFee(uint256 newFee) external onlyOwner {
        transferFee = newFee;
        emit TransferFeeUpdated(newFee);
    }

    // Withdraw contract balance
    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    // ------------------------------
    // BUY & TRANSFER
    // ------------------------------

    function buyItem(uint256 itemId) external payable notExpired(itemId) {
        require(isMinted[itemId], "Not minted");
        require(itemOwner[itemId] == address(0), "Already owned");
        require(msg.value >= minimumBuyPrice, "Buy price too low");

        itemOwner[itemId] = msg.sender;
        ownedItems[msg.sender].push(itemId);

        emit ItemBought(msg.sender, itemId, msg.value);
    }

    function transferItem(
        address to,
        uint256 itemId
    ) external payable notExpired(itemId) {
        require(itemOwner[itemId] == msg.sender, "Not owner");
        require(to != address(0), "Invalid recipient");
        require(msg.value >= transferFee, "Transfer fee required");

        _removeOwnedItem(msg.sender, itemId);
        itemOwner[itemId] = to;
        ownedItems[to].push(itemId);

        emit ItemTransferred(msg.sender, to, itemId, msg.value);
    }

    // ------------------------------
    // RENTING FEATURE
    // ------------------------------

    // Owner sets custom rent price for each item
    function setRentPrice(uint256 itemId, uint256 price) external {
        require(itemOwner[itemId] == msg.sender, "Not item owner");
        require(price >= minimumRentPrice, "Below minimum rent price");

        rentPrice[itemId] = price;
    }

    // Anyone can rent the item (does NOT transfer ownership)
    function rentItem(uint256 itemId) external payable notExpired(itemId) {
        require(isMinted[itemId], "Not minted");
        require(itemOwner[itemId] != address(0), "Item not bought yet");

        uint256 price = rentPrice[itemId];
        if (price == 0) price = minimumRentPrice;

        require(msg.value >= price, "Insufficient rent payment");

        renters[itemId].push(msg.sender);

        emit ItemRented(msg.sender, itemId, msg.value);
    }

    // ------------------------------
    // VIEW FUNCTIONS
    // ------------------------------

    function getOwnedItems(
        address user
    ) external view returns (uint256[] memory) {
        return ownedItems[user];
    }

    function getRenters(
        uint256 itemId
    ) external view returns (address[] memory) {
        return renters[itemId];
    }

    function isItemOwned(uint256 itemId) external view returns (bool) {
        return itemOwner[itemId] != address(0);
    }

    function isExpired(uint256 itemId) external view returns (bool) {
        return block.timestamp >= itemExpiry[itemId];
    }

    // ------------------------------
    // INTERNAL
    // ------------------------------

    function _removeOwnedItem(address user, uint256 itemId) internal {
        uint256[] storage items = ownedItems[user];
        for (uint256 i = 0; i < items.length; i++) {
            if (items[i] == itemId) {
                items[i] = items[items.length - 1];
                items.pop();
                break;
            }
        }
    }
}
