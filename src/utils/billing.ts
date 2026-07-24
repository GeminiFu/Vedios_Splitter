import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type Product,
  type Purchase,
} from 'react-native-iap';

export const PRODUCT_ID = 'unlock_full_version';

/** 建立與 Google Play 的連線 */
export const initBilling = async (): Promise<void> => {
  await initConnection();
};

export const closeBilling = async (): Promise<void> => {
  await endConnection();
};

/** 取得商品資訊（含當地價格字串） */
export const fetchProduct = async (): Promise<Product | null> => {
  const products = await getProducts({skus: [PRODUCT_ID]});
  return products[0] ?? null;
};

/** 發起購買 */
export const purchaseUnlock = async (): Promise<void> => {
  await requestPurchase({
    request: {
      android: {skus: [PRODUCT_ID]},
    },
  });
};

/** 查詢這個 Google 帳號是否已購買（換機 / 重裝還原用） */
export const checkPurchased = async (): Promise<boolean> => {
  try {
    const purchases = await getAvailablePurchases();
    return purchases.some(p => p.productId === PRODUCT_ID);
  } catch {
    return false;
  }
};

/** 完成交易，Google 才會真正記錄這筆購買 */
export const acknowledgePurchase = async (purchase: Purchase): Promise<void> => {
  await finishTransaction({purchase, isConsumable: false});
};

export {purchaseUpdatedListener, purchaseErrorListener};
export type {Purchase};