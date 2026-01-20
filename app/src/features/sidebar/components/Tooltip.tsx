import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "right",
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={cn("relative flex items-center shrink-0", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm dark:bg-gray-700 whitespace-nowrap",
            {
              "bottom-full left-1/2 -translate-x-1/2 mb-2": position === "top",
              "top-full left-1/2 -translate-x-1/2 mt-2": position === "bottom",
              "right-full top-1/2 -translate-y-1/2 mr-2": position === "left",
              "left-full top-1/2 -translate-y-1/2 ml-2": position === "right",
            },
          )}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn("absolute w-0 h-0 border-4 border-transparent", {
              "border-t-gray-900 dark:border-t-gray-700 top-full left-1/2 -translate-x-1/2":
                position === "top",
              "border-b-gray-900 dark:border-b-gray-700 bottom-full left-1/2 -translate-x-1/2":
                position === "bottom",
              "border-l-gray-900 dark:border-l-gray-700 left-full top-1/2 -translate-y-1/2":
                position === "left",
              "border-r-gray-900 dark:border-r-gray-700 right-full top-1/2 -translate-y-1/2":
                position === "right",
            })}
          />
        </div>
      )}
    </div>
  );
};
