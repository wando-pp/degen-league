// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DegenLeagueNFT {
    address public owner;
    uint256 private _nextTokenId;
    uint256 public constant MINT_PRICE = 0.000001 ether;
    uint256 public constant RENT_PRICE_PER_DAY = 0.00001 ether;

    struct GameCard {
        string team;
        uint8 rarity; // 1=Common, 2=Rare, 3=Legendary
        string[] players;
        uint256 points;
        bool isAvailable;
        address cardOwner;
    }

    struct Rental {
        address renter;
        uint256 expiresAt;
    }

    mapping(uint256 => GameCard) public gameCards;
    mapping(uint256 => Rental) public rentals;
    mapping(address => uint256) public squadPoints;
    mapping(address => uint256[]) public userSquad;

    event CardMinted(uint256 tokenId, string team, uint8 rarity, address owner);
    event CardRented(uint256 tokenId, address renter, uint256 duration);
    event CardBought(uint256 tokenId, address buyer, address seller);
    event CardAddedToSquad(address user, uint256 tokenId);
    event PointsUpdated(address user, uint256 totalPoints);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyCardOwner(uint256 tokenId) {
        require(gameCards[tokenId].cardOwner == msg.sender, "Not card owner");
        _;
    }

    function mintCard(
        string memory team,
        uint8 rarity,
        string[] memory players
    ) public payable {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        require(rarity >= 1 && rarity <= 3, "Invalid rarity");

        uint256 tokenId = _nextTokenId++;

        gameCards[tokenId] = GameCard({
            team: team,
            rarity: rarity,
            players: players,
            points: 0,
            isAvailable: true,
            cardOwner: msg.sender
        });

        emit CardMinted(tokenId, team, rarity, msg.sender);
    }

    function rentCard(uint256 tokenId, uint256 numDays) public payable {
        require(gameCards[tokenId].isAvailable, "Card not available");
        require(gameCards[tokenId].cardOwner != msg.sender, "Cannot rent your own card");
        require(msg.value >= RENT_PRICE_PER_DAY * numDays, "Insufficient payment");

        rentals[tokenId] = Rental({
            renter: msg.sender,
            expiresAt: block.timestamp + (numDays * 1 days)
        });

        // Pay owner
        payable(gameCards[tokenId].cardOwner).transfer(msg.value);

        emit CardRented(tokenId, msg.sender, numDays);
    }

    function buyCard(uint256 tokenId) public payable {
        require(gameCards[tokenId].isAvailable, "Card not available");
        address cardOwner = gameCards[tokenId].cardOwner;
        require(cardOwner != msg.sender, "Already own this card");
        require(msg.value >= MINT_PRICE * 2, "Insufficient payment");

        // Transfer payment to owner
        payable(cardOwner).transfer(msg.value);

        // Transfer ownership
        gameCards[tokenId].cardOwner = msg.sender;

        emit CardBought(tokenId, msg.sender, cardOwner);
    }

    function addToSquad(uint256 tokenId) public {
        require(
            gameCards[tokenId].cardOwner == msg.sender ||
            (rentals[tokenId].renter == msg.sender && rentals[tokenId].expiresAt > block.timestamp),
            "Not owner or renter"
        );
        require(userSquad[msg.sender].length < 11, "Squad is full");

        userSquad[msg.sender].push(tokenId);

        // Update points
        squadPoints[msg.sender] += gameCards[tokenId].points;

        emit CardAddedToSquad(msg.sender, tokenId);
        emit PointsUpdated(msg.sender, squadPoints[msg.sender]);
    }

    function removeFromSquad(uint256 tokenId) public {
        uint256[] storage squad = userSquad[msg.sender];
        for (uint256 i = 0; i < squad.length; i++) {
            if (squad[i] == tokenId) {
                squadPoints[msg.sender] -= gameCards[tokenId].points;
                squad[i] = squad[squad.length - 1];
                squad.pop();
                emit PointsUpdated(msg.sender, squadPoints[msg.sender]);
                break;
            }
        }
    }

    function updateCardPoints(uint256 tokenId, uint256 points) public onlyOwner {
        gameCards[tokenId].points = points;
    }

    function setCardAvailability(uint256 tokenId, bool available) public onlyCardOwner(tokenId) {
        gameCards[tokenId].isAvailable = available;
    }

    function getCardPlayers(uint256 tokenId) public view returns (string[] memory) {
        return gameCards[tokenId].players;
    }

    function getUserSquad(address user) public view returns (uint256[] memory) {
        return userSquad[user];
    }

    function getTotalCards() public view returns (uint256) {
        return _nextTokenId;
    }

    function isCardRented(uint256 tokenId) public view returns (bool) {
        return rentals[tokenId].expiresAt > block.timestamp;
    }

    function withdraw() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
}
