import React, {createContext, useContext, useState, useEffect} from 'react';
import {
  initTrial,
  getLocalPurchased,
  setLocalPurchased,
  TRIAL_DAYS,
} from '../utils/trialManager';

interface LicenseState {
  loading: boolean;
  isPurchased: boolean;
  daysRemaining: number;
  isExpired: boolean;
  showWelcome: boolean;
  dismissWelcome: () => void;
  showPaywall: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  /** 功能入口的守門員：可用回傳 true，否則跳付費牆並回傳 false */
  requireAccess: () => boolean;
  markPurchased: () => Promise<void>;
}

const LicenseContext = createContext<LicenseState | null>(null);

export function LicenseProvider({children}: {children: React.ReactNode}) {
  const [loading, setLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(TRIAL_DAYS);
  const [isExpired, setIsExpired] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    (async () => {
      const purchased = await getLocalPurchased();
      const trial = await initTrial();

      setIsPurchased(purchased);
      setDaysRemaining(trial.daysRemaining);
      setIsExpired(trial.isExpired);
      setShowWelcome(trial.isFirstLaunch && !purchased);
      setLoading(false);
    })();
  }, []);

  const requireAccess = (): boolean => {
    if (isPurchased || !isExpired) return true;
    setShowPaywall(true);
    return false;
  };

  const markPurchased = async () => {
    await setLocalPurchased(true);
    setIsPurchased(true);
    setShowPaywall(false);
  };

  return (
    <LicenseContext.Provider
      value={{
        loading,
        isPurchased,
        daysRemaining,
        isExpired,
        showWelcome,
        dismissWelcome: () => setShowWelcome(false),
        showPaywall,
        openPaywall: () => setShowPaywall(true),
        closePaywall: () => setShowPaywall(false),
        requireAccess,
        markPurchased,
      }}>
      {children}
    </LicenseContext.Provider>
  );
}

export const useLicense = (): LicenseState => {
  const ctx = useContext(LicenseContext);
  if (!ctx) throw new Error('useLicense must be used within LicenseProvider');
  return ctx;
};