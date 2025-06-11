import { useState } from "react";
import CryptoJS from "crypto-js";

const useAuthLocalStorage = (key: string, initialValue: any) => {
  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = () => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      const secretKey = window.localStorage.getItem("signInData") || "";
      return item ? JSON.parse(decryptData(item, secretKey)) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState(readValue);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
const setValue = (value: any) => {
  if (typeof window == "undefined") {
    console.warn(
      `Tried setting localStorage key “${key}” even though environment is not a client`
    );
  }

  try {
    // Allow value to be a function so we have the same API as useState
    const newValue = value instanceof Function ? value(storedValue) : value;
    const secretKey = window.localStorage.getItem("signInData") || ""; // Added fallback value

    // Save to local storage
    window.localStorage.setItem(
      key,
      encryptData(JSON.stringify(newValue), secretKey)
    );

    // Save state
    setStoredValue(newValue);

    // We dispatch a custom event so every useLocalStorage hook are notified
    window.dispatchEvent(new Event("local-storage"));
  } catch (error) {
    console.warn(`Error setting localStorage key “${key}”:`, error);
  }
};

  return [storedValue, setValue];
};

export const encryptData = (data: any, secretKey: string) => {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};

export const decryptData = (data: any, secretKey: string, isJSON: boolean = true) => {
  if (data === null) {
    return null;
  }
  const bytes = CryptoJS.AES.decrypt(data, secretKey);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  return decryptedData ? (isJSON ? JSON.parse(decryptedData) : decryptedData) : null;
};