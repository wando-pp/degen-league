"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import styles from "./admin.module.css";

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
    inputs: [
      { internalType: "uint256", name: "itemId", type: "uint256" },
      { internalType: "uint256", name: "expiryTimestamp", type: "uint256" },
    ],
    name: "mintItem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const CARD_IDS = [0, 1, 2, 3, 4, 5];

export default function AdminPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [expiryDays, setExpiryDays] = useState(30);

  const { data: contractOwner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "owner",
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

  const mintCard = (cardId: number) => {
    const expiryTimestamp =
      Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "mintItem",
      args: [BigInt(cardId), BigInt(expiryTimestamp)],
    });
  };

  const withdrawFunds = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "withdraw",
    });
  };

  if (!isConnected) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => router.push("/")} className={styles.backBtn}>
            ← BACK TO APP
          </button>
          <h1 className={styles.title}>ADMIN PANEL</h1>
          <ConnectWallet />
        </div>
        <div className={styles.message}>
          <p>Please connect your wallet to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => router.push("/")} className={styles.backBtn}>
            ← BACK TO APP
          </button>
          <h1 className={styles.title}>ADMIN PANEL</h1>
        </div>
        <div className={styles.message}>
          <p>Access Denied: You are not the contract owner.</p>
          <p className={styles.addressInfo}>Contract Owner: {contractOwner}</p>
          <p className={styles.addressInfo}>Your Address: {address}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.push("/")} className={styles.backBtn}>
          ← BACK TO APP
        </button>
        <h1 className={styles.title}>ADMIN PANEL</h1>
        <ConnectWallet />
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>MINT CARDS</h2>

          <div className={styles.expiryControl}>
            <label className={styles.label}>
              Expiry Duration (Days)
              <input
                type="number"
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                min="1"
                className={styles.input}
              />
            </label>
          </div>

          <div className={styles.cardGrid}>
            {CARD_IDS.map((cardId) => (
              <div key={cardId} className={styles.mintCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardId}>CARD #{cardId}</span>
                </div>
                <button
                  onClick={() => mintCard(cardId)}
                  disabled={isConfirming}
                  className={styles.mintBtn}
                >
                  {isConfirming ? "MINTING..." : "MINT CARD"}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>CONTRACT MANAGEMENT</h2>

          <div className={styles.actionCard}>
            <h3 className={styles.actionTitle}>Withdraw Funds</h3>
            <p className={styles.actionDesc}>
              Withdraw all contract balance to owner address
            </p>
            <button
              onClick={withdrawFunds}
              disabled={isConfirming}
              className={styles.withdrawBtn}
            >
              {isConfirming ? "PROCESSING..." : "WITHDRAW FUNDS"}
            </button>
          </div>
        </section>

        {isSuccess && (
          <div className={styles.successMessage}>✓ Transaction successful!</div>
        )}
      </div>
    </div>
  );
}
