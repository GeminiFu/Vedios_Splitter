import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_FIRST_LAUNCH = '@videosplitter:firstLaunchDate';
const KEY_PURCHASED = '@videosplitter:isPurchased';

export const TRIAL_DAYS = 30;

export interface TrialStatus {
  isFirstLaunch: boolean;
  daysRemaining: number;
  isExpired: boolean;
}

/** 首次啟動時記錄日期，回傳試用狀態 */
export const initTrial = async (): Promise<TrialStatus> => {
  const stored = await AsyncStorage.getItem(KEY_FIRST_LAUNCH);

  if (!stored) {
    const now = new Date().toISOString();
    await AsyncStorage.setItem(KEY_FIRST_LAUNCH, now);
    return {isFirstLaunch: true, daysRemaining: TRIAL_DAYS, isExpired: false};
  }

  return {...calculateStatus(stored), isFirstLaunch: false};
};

const calculateStatus = (
  firstLaunchISO: string,
): Omit<TrialStatus, 'isFirstLaunch'> => {
  const first = new Date(firstLaunchISO).getTime();
  const elapsedDays = Math.floor((Date.now() - first) / 86400000);
  const daysRemaining = Math.max(0, TRIAL_DAYS - elapsedDays);
  return {daysRemaining, isExpired: daysRemaining <= 0};
};

/** 本機的付費狀態快取（之後會由 Billing 查詢結果覆蓋） */
export const getLocalPurchased = async (): Promise<boolean> => {
  return (await AsyncStorage.getItem(KEY_PURCHASED)) === 'true';
};

export const setLocalPurchased = async (value: boolean): Promise<void> => {
  await AsyncStorage.setItem(KEY_PURCHASED, String(value));
};

// ── 開發測試用，正式版前移除 ──
export const __devResetTrial = async () => {
  await AsyncStorage.removeItem(KEY_FIRST_LAUNCH);
  await AsyncStorage.removeItem(KEY_PURCHASED);
};

export const __devSetTrialStartedDaysAgo = async (days: number) => {
  const date = new Date(Date.now() - days * 86400000).toISOString();
  await AsyncStorage.setItem(KEY_FIRST_LAUNCH, date);
};