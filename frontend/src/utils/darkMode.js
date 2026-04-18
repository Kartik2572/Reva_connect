const DARK_MODE_STORAGE_KEY = "darkModeEnabled";

export const getStoredDarkMode = () => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(DARK_MODE_STORAGE_KEY) === "true";
};

export const initializeDarkMode = () => {
  if (typeof window === "undefined") return;
  const enabled = getStoredDarkMode();
  document.documentElement.classList.toggle("dark", enabled);
};

export const setDarkMode = (enabled) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(DARK_MODE_STORAGE_KEY, String(enabled));
  document.documentElement.classList.toggle("dark", enabled);
};

export const toggleDarkMode = () => {
  const newValue = !getStoredDarkMode();
  setDarkMode(newValue);
  return newValue;
};
