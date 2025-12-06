'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import styles from './floating-banner.module.css';

export function FloatingBanner() {
  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDismiss = () => {
    // Only dismiss for current session - no persistence
    // Banner will reappear on page reload
    setIsDismissed(true);
  };

  // Prevent hydration mismatch - wait for client-side mount
  if (!mounted || isDismissed) {
    return null;
  }

  return (
    <div
      className={styles.bannerContainer}
      role="complementary"
      aria-label="Vibe3 branding banner"
    >
      <div className={styles.bannerContent}>
        {/* Link to Vibe3 */}
        <a
          href="https://vibe3.build"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.bannerLink}
        >
          <span>Made with</span>
          <Image
            src="/vibe3-logo.png"
            alt="Vibe3 logo"
            width={18}
            height={18}
            className={styles.logo}
          />
          <span className={styles.brandName}>vibe3</span>
        </a>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className={styles.dismissButton}
          aria-label="Dismiss banner"
        >
          <X className={styles.dismissIcon} />
        </button>
      </div>
    </div>
  );
}
