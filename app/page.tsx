"use client";

import { useEffect, useState, useRef } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useRouter } from "next/navigation";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { parseEther } from "viem";
import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import styles from "./page.module.css";

const CONTRACT_ADDRESS =
  "0x6ab265a5F196c334C42314B6828B234459f5dab2" as `0x${string}`;

const CONTRACT_ABI = [
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "itemId", type: "uint256" }],
    name: "isMinted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "itemId", type: "uint256" }],
    name: "itemOwner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "itemId", type: "uint256" }],
    name: "itemExpiry",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "itemId", type: "uint256" }],
    name: "buyItem",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "itemId", type: "uint256" }],
    name: "rentItem",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "minimumBuyPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minimumRentPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getOwnedItems",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "itemId", type: "uint256" }],
    name: "getRenters",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const SHOWCASE_CARDS = [
  {
    id: 0,
    cardName: "Asian Aces",
    team: "Global Squad",
    color: "#ffc107", // Updated color to yellow/gold for uniqueness
    rentPrice: "0.000008",
    duration: "7 days",
    type: "EPIC", // Changed type
    players: [
      { name: "Son Heung-min", multiplier: 2.8 },
      { name: "Mitoma", multiplier: 2.3 },
      { name: "Kim Min-jae", multiplier: 2.1 },
      { name: "Doan", multiplier: 1.8 },
      { name: "Takefusa Kubo", multiplier: 1.7 },
      { name: "Hwang Hee-chan", multiplier: 1.6 },
    ],
    rarity: 3,
    image:
      "https://res.cloudinary.com/dwf6iuvbh/image/upload/v1764081919/Gemini_Generated_Image_92m6ob92m6ob92m6-removebg-preview_ffjqee.png",
  },
  {
    id: 1,
    cardName: "Galacticos Legends",
    team: "Superstars XI",
    color: "#673ab7", // Updated color to purple
    rentPrice: "0.000010",
    duration: "7 days",
    type: "MYTHIC", // Highest tier
    players: [
      { name: "Messi", multiplier: 3.5 },
      { name: "Ronaldo", multiplier: 3.4 },
      { name: "De Bruyne", multiplier: 3.1 },
      { name: "Neymar", multiplier: 2.6 },
      { name: "Modric", multiplier: 2.2 },
      { name: "Benzema", multiplier: 2.0 },
    ],
    rarity: 4, // New rarity level
    image:
      "https://res.cloudinary.com/dwf6iuvbh/image/upload/v1764081105/Gemini_Generated_Image_eyyd8qeyyd8qeyyd-removebg-preview_gyriij.png",
  },
  {
    id: 2,
    cardName: "African Giants",
    team: "Continental XI",
    color: "#4caf50", // Updated color to green
    rentPrice: "0.000007",
    duration: "7 days",
    type: "LEGENDARY",
    players: [
      { name: "Salah", multiplier: 3.0 },
      { name: "Osimhen", multiplier: 2.7 },
      { name: "Iwobi", multiplier: 2.0 },
      { name: "Bounou", multiplier: 1.8 },
      { name: "Hakimi", multiplier: 2.1 },
      { name: "Kudus", multiplier: 1.9 },
    ],
    rarity: 3,
    image:
      "https://res.cloudinary.com/dwf6iuvbh/image/upload/v1764024510/Gemini_Generated_Image_v7yivfv7yivfv7yi-removebg-preview_qunn2t.png",
  },
  {
    id: 3,
    cardName: "Elite Red Devils",
    team: "Manchester United",
    color: "#f44336", // Updated color to red
    rentPrice: "0.000007",
    duration: "7 days",
    type: "EPIC",
    players: [
      { name: "Fernandes", multiplier: 2.5 },
      { name: "Mbuemo", multiplier: 2.3 },
      { name: "Sesko", multiplier: 2.1 },
      { name: "Dalot", multiplier: 1.8 },
      { name: "Martinez", multiplier: 1.7 },
      { name: "Mainoo", multiplier: 1.6 },
    ],
    rarity: 3,
    image:
      "https://res.cloudinary.com/dwf6iuvbh/image/upload/v1764024510/Gemini_Generated_Image_7u0i8x7u0i8x7u0i-removebg-preview_fbwtds.png",
  },
  {
    id: 4,
    cardName: "Wonderkid World",
    team: "Future Stars",
    color: "#2196f3", // Updated color to blue
    rentPrice: "0.000006",
    duration: "7 days",
    type: "RARE",
    players: [
      { name: "Yamal", multiplier: 2.8 },
      { name: "Endrick", multiplier: 2.5 },
      { name: "Zaire-Emery", multiplier: 2.2 },
      { name: "Garnacho", multiplier: 2.1 },
      { name: "Bellingham", multiplier: 3.0 },
      { name: "Gavi", multiplier: 2.0 },
    ],
    rarity: 2,
    image:
      "https://res.cloudinary.com/dwf6iuvbh/image/upload/v1764024510/Gemini_Generated_Image_xgjb1xgjb1xgjb1x-removebg-preview_thuwwd.png",
  },
  {
    id: 5,
    cardName: "UCL Elite Forces",
    team: "Champions XI",
    color: "#ff9800", // Updated color to orange
    rentPrice: "0.000009",
    duration: "7 days",
    type: "LEGENDARY",
    players: [
      { name: "Haaland", multiplier: 3.2 },
      { name: "Mbappe", multiplier: 3.1 },
      { name: "Rice", multiplier: 2.7 },
      { name: "Vinicius Jr", multiplier: 2.5 },
      { name: "Bellingham", multiplier: 3.0 },
      { name: "Sane", multiplier: 2.3 },
    ],
    rarity: 3,
    image:
      "https://res.cloudinary.com/dwf6iuvbh/image/upload/v1764024510/Gemini_Generated_Image_h4lv71h4lv71h4lv-removebg-preview_titbje.png",
  },
];

interface Player {
  name: string;
  multiplier: number;
}

interface CardStatus {
  isMinted: boolean;
  isOwned: boolean;
  isRented: boolean;
  loading: boolean;
}

export default function Home() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cardStatuses, setCardStatuses] = useState<Record<number, CardStatus>>(
    {}
  );
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(
    new Set()
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: contractOwner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "owner",
  });

  const { data: minBuyPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "minimumBuyPrice",
  });

  const { data: minRentPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "minimumRentPrice",
  });

  const { data: ownedItems } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getOwnedItems",
    args: address ? [address] : undefined,
  });

  // Read renters for each card to check if user has rented
  const card0Renters = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getRenters",
    args: [BigInt(0)],
  });
  const card1Renters = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getRenters",
    args: [BigInt(1)],
  });
  const card2Renters = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getRenters",
    args: [BigInt(2)],
  });
  const card3Renters = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getRenters",
    args: [BigInt(3)],
  });
  const card4Renters = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getRenters",
    args: [BigInt(4)],
  });
  const card5Renters = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getRenters",
    args: [BigInt(5)],
  });

  // Read mint status for each card
  const card0Minted = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "isMinted",
    args: [BigInt(0)],
  });
  const card1Minted = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "isMinted",
    args: [BigInt(1)],
  });
  const card2Minted = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "isMinted",
    args: [BigInt(2)],
  });
  const card3Minted = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "isMinted",
    args: [BigInt(3)],
  });
  const card4Minted = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "isMinted",
    args: [BigInt(4)],
  });
  const card5Minted = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "isMinted",
    args: [BigInt(5)],
  });

  // Read owner address for each card
  const card0Owner = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "itemOwner",
    args: [BigInt(0)],
  });
  const card1Owner = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "itemOwner",
    args: [BigInt(1)],
  });
  const card2Owner = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "itemOwner",
    args: [BigInt(2)],
  });
  const card3Owner = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "itemOwner",
    args: [BigInt(3)],
  });
  const card4Owner = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "itemOwner",
    args: [BigInt(4)],
  });
  const card5Owner = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "itemOwner",
    args: [BigInt(5)],
  });

  // Read expiry timestamps for each card
  const card0Expiry = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "itemExpiry",
    args: [BigInt(0)],
  });
  const card1Expiry = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "itemExpiry",
    args: [BigInt(1)],
  });
  const card2Expiry = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "itemExpiry",
    args: [BigInt(2)],
  });
  const card3Expiry = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "itemExpiry",
    args: [BigInt(3)],
  });
  const card4Expiry = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "itemExpiry",
    args: [BigInt(4)],
  });
  const card5Expiry = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "itemExpiry",
    args: [BigInt(5)],
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const isOwner =
    isConnected &&
    address &&
    contractOwner &&
    address.toLowerCase() === contractOwner.toLowerCase();

  // Update card statuses from contract reads
  useEffect(() => {
    const mintedData = [
      card0Minted.data,
      card1Minted.data,
      card2Minted.data,
      card3Minted.data,
      card4Minted.data,
      card5Minted.data,
    ];
    const ownerData = [
      card0Owner.data,
      card1Owner.data,
      card2Owner.data,
      card3Owner.data,
      card4Owner.data,
      card5Owner.data,
    ];
    const rentersData = [
      card0Renters.data,
      card1Renters.data,
      card2Renters.data,
      card3Renters.data,
      card4Renters.data,
      card5Renters.data,
    ];

    const statuses: Record<number, CardStatus> = {};
    SHOWCASE_CARDS.forEach((card, index) => {
      const cardOwner = ownerData[index] as `0x${string}` | undefined;
      const isCurrentUserOwner =
        address &&
        cardOwner &&
        cardOwner.toLowerCase() === address.toLowerCase();

      const rentersArray = rentersData[index] as
        | readonly `0x${string}`[]
        | undefined;
      const hasRented =
        address && rentersArray
          ? rentersArray.some(
              (renter: `0x${string}`) =>
                renter.toLowerCase() === address.toLowerCase()
            )
          : false;

      statuses[card.id] = {
        isMinted: mintedData[index] === true,
        isOwned: isCurrentUserOwner || false,
        isRented: hasRented,
        loading: false,
      };
    });
    setCardStatuses(statuses);
    setIsLoading(false);
  }, [
    card0Minted.data,
    card1Minted.data,
    card2Minted.data,
    card3Minted.data,
    card4Minted.data,
    card5Minted.data,
    card0Owner.data,
    card1Owner.data,
    card2Owner.data,
    card3Owner.data,
    card4Owner.data,
    card5Owner.data,
    card0Renters.data,
    card1Renters.data,
    card2Renters.data,
    card3Renters.data,
    card4Renters.data,
    card5Renters.data,
    address,
    isSuccess,
  ]);

  const buyCard = (itemId: number) => {
    if (!minBuyPrice) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "buyItem",
      args: [BigInt(itemId)],
      value: minBuyPrice,
    });
  };

  const rentCard = (itemId: number) => {
    if (!minRentPrice) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "rentItem",
      args: [BigInt(itemId)],
      value: minRentPrice,
    });
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const togglePlayerSelection = (playerKey: string) => {
    setSelectedPlayers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playerKey)) {
        newSet.delete(playerKey);
      } else if (newSet.size < 11) {
        newSet.add(playerKey);
      }
      return newSet;
    });
  };

  const getDaysLeft = (cardId: number): string => {
    const expiryData = [
      card0Expiry.data,
      card1Expiry.data,
      card2Expiry.data,
      card3Expiry.data,
      card4Expiry.data,
      card5Expiry.data,
    ];
    const expiry = expiryData[cardId] as bigint | undefined;

    if (!expiry || expiry === BigInt(0)) return "0 days";

    const now = Math.floor(Date.now() / 1000);
    const expiryTimestamp = Number(expiry);
    const secondsLeft = expiryTimestamp - now;

    if (secondsLeft <= 0) return "EXPIRED";

    const days = Math.floor(secondsLeft / (24 * 60 * 60));
    const hours = Math.floor((secondsLeft % (24 * 60 * 60)) / (60 * 60));

    if (days > 0) {
      return `${days}d ${hours}h left`;
    } else {
      return `${hours}h left`;
    }
  };

  // Get all players from owned AND rented cards
  const getAllPlayers = () => {
    const allPlayers: Array<{
      key: string;
      name: string;
      multiplier: number;
      cardName: string;
      cardId: number;
      status: "bought" | "rented";
    }> = [];

    // Add owned cards
    if (ownedItems && ownedItems.length > 0) {
      ownedItems.forEach((itemId) => {
        const card = SHOWCASE_CARDS.find((c) => c.id === Number(itemId));
        if (card) {
          card.players.forEach((player, idx) => {
            allPlayers.push({
              key: `owned-${card.id}-${idx}`,
              name: player.name,
              multiplier: player.multiplier,
              cardName: card.cardName,
              cardId: card.id,
              status: "bought",
            });
          });
        }
      });
    }

    // Add rented cards
    Object.entries(cardStatuses).forEach(([cardId, status]) => {
      if (status.isRented && !status.isOwned) {
        const card = SHOWCASE_CARDS.find((c) => c.id === Number(cardId));
        if (card) {
          card.players.forEach((player, idx) => {
            allPlayers.push({
              key: `rented-${card.id}-${idx}`,
              name: player.name,
              multiplier: player.multiplier,
              cardName: card.cardName,
              cardId: card.id,
              status: "rented",
            });
          });
        }
      }
    });

    return allPlayers;
  };

  // Get all participants for the leaderboard (owners + renters)
  const getAllParticipants = () => {
    const participantsMap = new Map<
      string,
      {
        address: string;
        cardsOwned: number;
        cardsRented: number;
        totalPower: number;
      }
    >();

    const ownerData = [
      card0Owner.data,
      card1Owner.data,
      card2Owner.data,
      card3Owner.data,
      card4Owner.data,
      card5Owner.data,
    ];
    const rentersData = [
      card0Renters.data,
      card1Renters.data,
      card2Renters.data,
      card3Renters.data,
      card4Renters.data,
      card5Renters.data,
    ];

    // Collect all owners
    ownerData.forEach((owner, cardIndex) => {
      const ownerAddress = owner as `0x${string}` | undefined;
      if (
        ownerAddress &&
        ownerAddress !== "0x0000000000000000000000000000000000000000"
      ) {
        const card = SHOWCASE_CARDS[cardIndex];
        const cardPower = card.players.reduce(
          (sum, p) => sum + p.multiplier,
          0
        );
        const lowerAddress = ownerAddress.toLowerCase();

        if (participantsMap.has(lowerAddress)) {
          const existing = participantsMap.get(lowerAddress)!;
          existing.cardsOwned += 1;
          existing.totalPower += cardPower;
        } else {
          participantsMap.set(lowerAddress, {
            address: ownerAddress,
            cardsOwned: 1,
            cardsRented: 0,
            totalPower: cardPower,
          });
        }
      }
    });

    // Collect all renters
    rentersData.forEach((renters, cardIndex) => {
      const rentersArray = renters as readonly `0x${string}`[] | undefined;
      if (rentersArray && rentersArray.length > 0) {
        const card = SHOWCASE_CARDS[cardIndex];
        const cardPower = card.players.reduce(
          (sum, p) => sum + p.multiplier,
          0
        );

        // Get unique renters for this card
        const uniqueRenters = Array.from(
          new Set(rentersArray.map((r) => r.toLowerCase()))
        );

        uniqueRenters.forEach((renterAddress) => {
          // Only count as rental if they don't own this card
          const ownerAddress = ownerData[cardIndex] as
            | `0x${string}`
            | undefined;
          const isOwner =
            ownerAddress && ownerAddress.toLowerCase() === renterAddress;

          if (!isOwner) {
            if (participantsMap.has(renterAddress)) {
              const existing = participantsMap.get(renterAddress)!;
              existing.cardsRented += 1;
              existing.totalPower += cardPower;
            } else {
              participantsMap.set(renterAddress, {
                address: renterAddress as `0x${string}`,
                cardsOwned: 0,
                cardsRented: 1,
                totalPower: cardPower,
              });
            }
          }
        });
      }
    });

    // Convert to array and sort by total power descending
    return Array.from(participantsMap.values()).sort(
      (a, b) => b.totalPower - a.totalPower
    );
  };

  const getCardButtons = (card: (typeof SHOWCASE_CARDS)[0]) => {
    const status = cardStatuses[card.id];

    if (!status || status.loading) {
      return (
        <div className={styles.cardStatus}>
          <span className={styles.statusLabel}>LOADING...</span>
        </div>
      );
    }

    // Not minted - show "Incoming"
    if (!status.isMinted) {
      return (
        <div className={styles.cardStatus}>
          <span className={styles.statusLabel}>INCOMING</span>
        </div>
      );
    }

    // User has rented this card - show RENTED badge only
    if (status.isRented && !status.isOwned) {
      return (
        <div className={styles.cardStatus}>
          <span className={styles.statusBadgeRented}>RENTED</span>
        </div>
      );
    }

    // User owns this card - show BOUGHT badge only
    if (status.isOwned) {
      return (
        <div className={styles.cardStatus}>
          <span className={styles.statusBadge}>BOUGHT</span>
        </div>
      );
    }

    // Check if card has been bought by anyone (has an owner)
    const ownerData = [
      card0Owner.data,
      card1Owner.data,
      card2Owner.data,
      card3Owner.data,
      card4Owner.data,
      card5Owner.data,
    ];
    const cardOwner = ownerData[card.id] as `0x${string}` | undefined;
    const hasSomeOwner =
      cardOwner && cardOwner !== "0x0000000000000000000000000000000000000000";

    // If card has owner - show RENT button only
    if (hasSomeOwner) {
      return (
        <div className={styles.cardActions}>
          <button
            className={styles.actionBtn}
            onClick={(e) => {
              e.stopPropagation();
              rentCard(card.id);
            }}
            disabled={isConfirming}
          >
            {isConfirming ? "RENTING..." : "RENT"}
          </button>
        </div>
      );
    }

    // Minted but not bought by anyone - show BUY button only
    return (
      <div className={styles.cardActions}>
        <button
          className={styles.actionBtn}
          onClick={(e) => {
            e.stopPropagation();
            buyCard(card.id);
          }}
          disabled={isConfirming}
        >
          {isConfirming ? "BUYING..." : "BUY"}
        </button>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.logo}>DEGEN LEAGUE</div>
        <div className={styles.walletSection}>
          {isConnected ? (
            <>
              {isOwner && (
                <button
                  onClick={() => router.push("/admin")}
                  className={styles.adminBtn}
                >
                  ADMIN
                </button>
              )}
              <ConnectWallet />
              <button
                onClick={() => disconnect()}
                className={styles.disconnectBtn}
              >
                DISCONNECT
              </button>
            </>
          ) : (
            <ConnectWallet />
          )}
        </div>
      </div>

      <div className={styles.heroSection}>
        <div className={styles.stadiumLights}>
          <div className={styles.light}></div>
          <div className={styles.light}></div>
          <div className={styles.light}></div>
          <div className={styles.light}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <h1 className={styles.title}>
              <span className={styles.titleLine1}>DEGEN</span>
              <span className={styles.titleLine2}>LEAGUE</span>
            </h1>

            <p className={styles.heroDescription}>
              Build your ultimate fantasy squad. Rent legendary player cards,
              compete on the leaderboard, and dominate the game.
            </p>

            <div className={styles.heroFeatures}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>⚡</div>
                <div className={styles.featureText}>
                  <div className={styles.featureTitle}>Rent or Buy</div>
                  <div className={styles.featureDesc}>
                    Access elite cards instantly
                  </div>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>🏆</div>
                <div className={styles.featureText}>
                  <div className={styles.featureTitle}>Squad Builder</div>
                  <div className={styles.featureDesc}>
                    Max 11 cards per team
                  </div>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>💎</div>
                <div className={styles.featureText}>
                  <div className={styles.featureTitle}>Multipliers</div>
                  <div className={styles.featureDesc}>
                    Boost your squad points
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.stadiumGraphic}>
              <div className={styles.fieldContainer}>
                <div className={styles.field}>
                  <div className={styles.centerCircle}></div>
                  <div className={styles.centerLine}></div>
                  <div className={styles.penaltyBox}></div>
                  <div className={styles.penaltyBoxBottom}></div>
                  <div className={styles.ball}>⚽</div>
                </div>
                <div className={styles.statsOverlay}>
                  <div className={styles.statItem}>
                    <div className={styles.statValue}>
                      {SHOWCASE_CARDS.length}
                    </div>
                    <div className={styles.statLabel}>CARDS</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statValue}>11</div>
                    <div className={styles.statLabel}>MAX SQUAD</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>AVAILABLE CARDS</h2>
          <div className={styles.scrollControls}>
            <button
              className={styles.scrollBtn}
              onClick={() => scroll("left")}
              aria-label="Scroll left"
            >
              ←
            </button>
            <button
              className={styles.scrollBtn}
              onClick={() => scroll("right")}
              aria-label="Scroll right"
            >
              →
            </button>
          </div>
        </div>

        <div className={styles.cardsWrapper}>
          <div className={styles.cardsScroll} ref={scrollRef}>
            {SHOWCASE_CARDS.map((card) => (
              <div
                key={card.id}
                className={`${styles.cardContainer} ${
                  flippedCard === card.id ? styles.flipped : ""
                }`}
                onClick={() =>
                  setFlippedCard(flippedCard === card.id ? null : card.id)
                }
              >
                <div className={styles.card}>
                  <div
                    className={styles.cardFront}
                    style={{ "--team-color": card.color } as any}
                  >
                    <div className={styles.cardRarity}>{card.type}</div>
                    {card.image && (
                      <div className={styles.cardImageWrapper}>
                        <img
                          src={card.image}
                          alt={card.cardName}
                          className={styles.cardImage}
                        />
                      </div>
                    )}
                    <div className={styles.cardName}>{card.cardName}</div>
                    <div className={styles.cardDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>RENT</span>
                        <span className={styles.detailValue}>
                          {card.rentPrice} ETH
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>
                          {cardStatuses[card.id]?.isMinted
                            ? "EXPIRES"
                            : "DURATION"}
                        </span>
                        <span className={styles.detailValue}>
                          {cardStatuses[card.id]?.isMinted
                            ? getDaysLeft(card.id)
                            : card.duration}
                        </span>
                      </div>
                    </div>
                    {getCardButtons(card)}
                  </div>

                  <div
                    className={styles.cardBack}
                    style={{ "--team-color": card.color } as any}
                  >
                    <div className={styles.cardBackHeader}>SQUAD</div>
                    <div className={styles.playersList}>
                      {card.players.map((player, idx) => (
                        <div key={idx} className={styles.playerName}>
                          <span>{player.name}</span>
                          <span className={styles.multiplier}>
                            {player.multiplier}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {isConnected && (
        <section className={styles.section}>
          <div className={styles.dualPanel}>
            {/* Squad Builder - Left Side */}
            <div className={styles.panelLeft}>
              <div className={styles.squadBuilderHeader}>
                <h2 className={styles.sectionTitle}>SQUAD BUILDER</h2>
                <div className={styles.selectionCounter}>
                  {selectedPlayers.size} / 11 SELECTED
                </div>
              </div>

              <div className={styles.playersList}>
                {getAllPlayers().length > 0 ? (
                  getAllPlayers().map((player) => (
                    <div key={player.key} className={styles.playerItem}>
                      <label className={styles.playerLabel}>
                        <input
                          type="checkbox"
                          checked={selectedPlayers.has(player.key)}
                          onChange={() => togglePlayerSelection(player.key)}
                          disabled={
                            !selectedPlayers.has(player.key) &&
                            selectedPlayers.size >= 11
                          }
                          className={styles.playerCheckbox}
                        />
                        <div className={styles.playerDetails}>
                          <span className={styles.playerName}>
                            {player.name}
                          </span>
                          <div className={styles.playerCardRow}>
                            <span className={styles.playerCard}>
                              {player.cardName}
                            </span>
                            <span
                              className={
                                player.status === "bought"
                                  ? styles.playerStatusBought
                                  : styles.playerStatusRented
                              }
                            >
                              {player.status === "bought" ? "BOUGHT" : "RENTED"}
                            </span>
                          </div>
                        </div>
                        <span className={styles.playerMultiplier}>
                          {player.multiplier}x
                        </span>
                      </label>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptySquad}>
                    <p>No cards in your squad yet</p>
                    <p className={styles.emptyHint}>
                      Buy cards to build your ultimate team
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Leaderboard - Right Side */}
            <div className={styles.panelRight}>
              <h2 className={styles.sectionTitle}>LEADERBOARD</h2>
              <div className={styles.leaderboard}>
                {getAllParticipants().length > 0 ? (
                  getAllParticipants().map((participant, index) => (
                    <div
                      key={participant.address}
                      className={styles.leaderboardRow}
                    >
                      <span className={styles.rank}>#{index + 1}</span>
                      <div className={styles.leaderInfo}>
                        <span className={styles.leaderAddress}>
                          {participant.address.slice(0, 6)}...
                          {participant.address.slice(-4)}
                          {address &&
                            participant.address.toLowerCase() ===
                              address.toLowerCase() &&
                            " (You)"}
                        </span>
                        <div className={styles.leaderStats}>
                          {participant.cardsOwned > 0 && (
                            <span className={styles.cardsOwned}>
                              {participant.cardsOwned} Owned
                            </span>
                          )}
                          {participant.cardsRented > 0 && (
                            <span className={styles.cardsOwned}>
                              {participant.cardsRented} Rented
                            </span>
                          )}
                          <span className={styles.leaderPoints}>
                            {participant.totalPower.toFixed(1)}x POWER
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>No participants yet</p>
                    <p className={styles.emptyHint}>
                      Be the first to own or rent a card!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
