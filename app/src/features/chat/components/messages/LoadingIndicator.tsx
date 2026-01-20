import React, { useEffect, memo } from "react";
import pinacLogo from "@/assets/icon/Round App Logo.svg";

interface LoadingIndicatorProps {
  modelName: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = memo(
  ({ modelName }) => {
    // Inject keyframes for loading animation
    useEffect(() => {
      const styleId = "loading-indicator-keyframes";

      // Check if styles already exist
      if (document.getElementById(styleId)) return;

      const style = document.createElement("style");
      style.id = styleId;
      style.innerHTML = `
      @keyframes fade458 {
        from { opacity: 1; }
        to { opacity: 0.25; }
      }
    `;
      document.head.appendChild(style);

      return () => {
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
      };
    }, []);

    // Generate 12 bars for the circular loading animation
    const bars = Array.from({ length: 12 }, (_, i) => ({
      rotation: i * 30,
      delay: i === 0 ? 0 : -(1.1 - i * 0.1),
    }));

    return (
      <div className="flex justify-start mt-6">
        {/* Avatar */}
        <div className="size-[35px] mt-1 rounded-full dark:border-[1.5px] dark:border-gray-500 flex justify-center items-center flex-shrink-0">
          <img src={pinacLogo} alt="AI Avatar" />
        </div>

        {/* Loading content */}
        <div className="flex flex-col max-w-md px-4 text-base font-medium text-gray-600 dark:text-gray-300">
          {/* Model name */}
          <div className="text-sm text-gray-600 dark:text-gray-500 mb-3">
            {modelName}
          </div>

          {/* Animated spinner + text */}
          <div className="flex items-center">
            {/* Circular spinner */}
            <div className="relative size-7" aria-hidden="true">
              {bars.map((bar, index) => (
                <div
                  key={index}
                  className="w-[8%] h-[24%] bg-gray-700 dark:bg-zinc-400 absolute left-1/2 top-[30%] opacity-0 rounded-3xl shadow-sm"
                  style={{
                    transform: `rotate(${bar.rotation}deg) translate(0, -130%)`,
                    animation: `fade458 1s linear infinite`,
                    animationDelay: `${bar.delay}s`,
                  }}
                />
              ))}
            </div>

            {/* Loading text */}
            <span className="pl-4" aria-live="polite">
              thinking...
            </span>
          </div>
        </div>
      </div>
    );
  },
);

LoadingIndicator.displayName = "LoadingIndicator";
