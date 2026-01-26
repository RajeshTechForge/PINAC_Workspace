import { useEffect, useState, useRef } from "react";
import { useModelSettings } from "@/contexts";
import { getProviderByDisplayName } from "@/config/models";

// Icon
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

interface DropdownMenuProps {
  defaultOption: string | null;
  optionList: Array<string>;
  valueName?: "provider" | "model";
  disabled?: boolean;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  defaultOption,
  optionList,
  valueName,
  disabled = false,
}) => {
  const modelSettings = useModelSettings();
  const [selectedOption, setSelectedOption] = useState(defaultOption);
  const [isActive, setIsActive] = useState(false);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);

  const onClick = (option: string) => {
    if (!valueName || disabled) return;

    if (valueName === "provider") {
      const provider = getProviderByDisplayName(option);
      if (provider) {
        modelSettings.setSelectedProvider(provider.id);
      }
    } else if (valueName === "model") {
      const availableModels = modelSettings.getAvailableModels(
        modelSettings.selectedProviderId,
      );
      const model = availableModels.find((m) => m.displayName === option);
      if (model) {
        modelSettings.setSelectedModel(model.id);
      }
    }

    setSelectedOption(option);
    setIsActive(false);
  };

  useEffect(() => {
    if (!valueName) return;

    let currentOption: string | null = null;

    if (valueName === "provider") {
      currentOption = modelSettings.getCurrentProviderName();
    } else if (valueName === "model") {
      currentOption = modelSettings.getCurrentModelName();
    }

    if (currentOption != null) {
      setSelectedOption(currentOption);
    }
  }, [modelSettings, valueName]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClicks = (e: MouseEvent) => {
      if (
        isActive &&
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(e.target as Node)
      ) {
        setIsActive(false);
      }
    };
    window.addEventListener("mousedown", handleOutsideClicks);
    return () => window.removeEventListener("mousedown", handleOutsideClicks);
  }, [isActive]);

  return (
    <div className="w-full text-gray-200" ref={dropdownMenuRef}>
      <div
        className={`w-64 h-9 pl-2 flex items-center justify-between rounded-lg
        bg-gray-700 dark:bg-tertiary-dark ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span>{selectedOption || "Not Selected"}</span>
        <button
          className={`h-full pl-2.5 pr-3 flex items-center justify-center rounded-r-lg
          ${disabled ? "cursor-not-allowed" : "hover:bg-gray-600 dark:hover:bg-zinc-600 cursor-pointer"}`}
          onClick={() => !disabled && setIsActive(!isActive)}
          disabled={disabled}
        >
          {isActive ? <IoIosArrowUp size={24} /> : <IoIosArrowDown size={24} />}
        </button>
      </div>
      <div
        className={
          isActive
            ? "absolute w-48 lg:w-52 mt-2 rounded-lg bg-gray-700 dark:bg-tertiary-dark border border-gray-500 dark:border-zinc-500 shadow-xl"
            : "hidden"
        }
      >
        <ul className="style-none">
          {optionList.map((option, index) => (
            <li
              className="flex items-center justify-start p-2 rounded-lg
              hover:bg-gray-600 dark:hover:bg-zinc-600 cursor-pointer"
              key={index}
              onClick={() => onClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
