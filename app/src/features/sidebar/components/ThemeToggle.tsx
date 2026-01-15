import { useEffect, useState } from "react";
import { getStoredTheme, setStoredTheme } from "../../../context/ThemeManager";

// icons
import { MdWbSunny } from "react-icons/md";
import { BsMoonStarsFill } from "react-icons/bs";

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = getStoredTheme();
    setIsDark(theme === "dark");
    setStoredTheme(theme);
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    setStoredTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="w-full flex items-center justify-center btn btn-ghost btn-circle cursor-pointer"
    >
      {isDark ? (
        <BsMoonStarsFill size={25} className="text-violet-700" />
      ) : (
        <MdWbSunny size={25} className="text-yellow-400" />
      )}
    </button>
  );
};
