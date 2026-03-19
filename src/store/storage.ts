// src/store/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORE_KEYS = {
  PRODUCT_MEMORY_PREFIX: '@product_memory_',
  ACTIVE_CART: '@active_shopping_cart',
  BUDGET_LIMIT: '@budget_limit'
};

/**
 * saveProductMemory - Saves the scanned item's price/MRP so it auto-fills next time.
 * @param {string} barcode 
 * @param {object} productData 
 */
export const saveProductMemory = async (barcode: string, productData: any) => {
  try {
    const key = `${STORE_KEYS.PRODUCT_MEMORY_PREFIX}${barcode}`;
    const jsonValue = JSON.stringify(productData);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`[Storage Engine] Failed to save product memory for barcode ${barcode}:`, error);
  }
};

/**
 * getProductMemory - Retrieves the data for auto-filling logic.
 * @param {string} barcode 
 * @returns {object | null} 
 */
export const getProductMemory = async (barcode: string) => {
  try {
    const key = `${STORE_KEYS.PRODUCT_MEMORY_PREFIX}${barcode}`;
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`[Storage Engine] Failed to get product memory for barcode ${barcode}:`, error);
    return null;
  }
};

/**
 * saveActiveCart - Saves the user's current shopping session dynamically.
 * @param {Array} cartItems 
 */
export const saveActiveCart = async (cartItems: any[]) => {
  try {
    const jsonValue = JSON.stringify(cartItems);
    await AsyncStorage.setItem(STORE_KEYS.ACTIVE_CART, jsonValue);
  } catch (error) {
    console.error(`[Storage Engine] Failed to save active cart:`, error);
  }
};

/**
 * loadActiveCart - Restores the session if the app is closed in the middle of the store.
 * @returns {Array} cart items sequence
 */
export const loadActiveCart = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORE_KEYS.ACTIVE_CART);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error(`[Storage Engine] Failed to load active cart:`, error);
    return [];
  }
};
/**
 * saveBudget - Persists the user's budget limit.
 * @param {number} budget 
 */
export const saveBudget = async (budget: number) => {
  try {
    await AsyncStorage.setItem(STORE_KEYS.BUDGET_LIMIT, budget.toString());
  } catch (error) {
    console.error(`[Storage Engine] Failed to save budget:`, error);
  }
};

/**
 * getBudget - Retrieves the saved budget limit.
 * @returns {number | null}
 */
export const getBudget = async () => {
  try {
    const value = await AsyncStorage.getItem(STORE_KEYS.BUDGET_LIMIT);
    return value != null ? parseFloat(value) : null;
  } catch (error) {
    console.error(`[Storage Engine] Failed to get budget:`, error);
    return null;
  }
};

/**
 * clearActiveCart - Resets the shopping trip.
 */
export const clearActiveCart = async () => {
  try {
    await AsyncStorage.removeItem(STORE_KEYS.ACTIVE_CART);
  } catch (error) {
    console.error(`[Storage Engine] Failed to clear active cart:`, error);
  }
};
