import React, {createContext, useContext, useState, useEffect, useRef} from 'react';
import {
  initTrial,
  getLocalPurchased,
  setLocalPurchased,
  TRIAL_DAYS,
} from '../utils/trialManager';
import {
  initBilling,
  closeBilling,
  fetchProduct,
  purchaseUnlock,
  checkPurchased,
  acknowledgePurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  PRODUCT_ID,
  type Purchase,
} from '../utils/billing';

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
  requireAccess: () => boolean;
  /** 商品的當地價格字串，例如 "NT$39.00"；取不到時為 null */
  localizedPrice: string | null;
  purchasing: boolean;
  restoring: boolean;
  buy: () => Promise<void>;
  restore: () => Promise<boolean>;
}

const LicenseContext = createContext<LicenseState | null>(null);

export function LicenseProvider({children}: {children: React.ReactNode}) {
  const [loading, setLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(TRIAL_DAYS);
  const [isExpired, setIsExpired] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [localizedPrice, setLocalizedPrice] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const purchasedRef = useRef(false);

  const applyPurchased = async () => {
    purchasedRef.current = true;
    await setLocalPurchased(true);
    setIsPurchased(true);
    setShowPaywall(false);
    setPurchasing(false);
  };

  useEffect(() => {
    let updateSub: any;
    let errorSub: any;

    (async () => {
      // 1. 先讀本機快取，讓畫面能立刻反應
      const cached = await getLocalPurchased();
      setIsPurchased(cached);
      purchasedRef.current = cached;

      // 2. 試用期狀態
      const trial = await initTrial();
      setDaysRemaining(trial.daysRemaining);
      setIsExpired(trial.isExpired);
      setShowWelcome(trial.isFirstLaunch && !cached);
      setLoading(false);

      // 3. 連上 Google Play（失敗不影響 App 使用）
      try {
        await initBilling();

        updateSub = purchaseUpdatedListener(async (purchase: Purchase) => {
          if (purchase.productId !== PRODUCT_ID) return;
          await acknowledgePurchase(purchase);
          await applyPurchased();
        });

        errorSub = purchaseErrorListener(() => {
          setPurchasing(false);
        });

        // 4. 以 Google 的紀錄為準，還原購買狀態
        const owned = await checkPurchased();
        if (owned && !purchasedRef.current) {
          await applyPurchased();
        }

        // 5. 取得當地價格
        const product = await fetchProduct();
        if (product) {
          setLocalizedPrice(
            (product as any).localizedPrice ??
              (product as any).oneTimePurchaseOfferDetails?.formattedPrice ??
              null,
          );
        }
      } catch {
        // 離線或 Billing 不可用，靜默忽略，沿用本機狀態
      }
    })();

    return () => {
      updateSub?.remove();
      errorSub?.remove();
      closeBilling();
    };
  }, []);

  const requireAccess = (): boolean => {
    if (isPurchased || !isExpired) return true;
    setShowPaywall(true);
    return false;
  };

  const buy = async () => {
    setPurchasing(true);
    try {
      await purchaseUnlock();
      // 成功會由 purchaseUpdatedListener 接手
    } catch {
      setPurchasing(false);
    }
  };

  const restore = async (): Promise<boolean> => {
    setRestoring(true);
    try {
      const owned = await checkPurchased();
      if (owned) await applyPurchased();
      return owned;
    } catch {
      return false;
    } finally {
      setRestoring(false);
    }
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
        localizedPrice,
        purchasing,
        restoring,
        buy,
        restore,
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