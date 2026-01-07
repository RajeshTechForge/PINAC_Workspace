const THEME_KEY = "preferred-theme";

export const getStoredTheme = (): "light" | "dark" => {
  return (localStorage.getItem(THEME_KEY) as "light" | "dark") || "dark";
};

export const setStoredTheme = (theme: "light" | "dark") => {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
};

export const applyTheme = (theme: "light" | "dark") => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};
