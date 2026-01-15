import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

interface TooltipProps {
  content: string;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const childRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (childRef.current) {
      const rect = childRef.current.getBoundingClientRect();
      setPosition({
        // Position tooltip vertically centered with the trigger element
        top: rect.top + rect.height / 2,
        // Position tooltip to the right of the trigger element with a small gap
        left: rect.right + 8, // 8px gap
      });
    }
  };

  const handleMouseEnter = () => {
    updatePosition(); // Calculate position
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Recalculate position on scroll or resize while visible
  useEffect(() => {
    if (isVisible) {
      const handleScrollResize = () => updatePosition();
      window.addEventListener("scroll", handleScrollResize, true); // Capture scroll events
      window.addEventListener("resize", handleScrollResize);
      return () => {
        window.removeEventListener("scroll", handleScrollResize, true);
        window.removeEventListener("resize", handleScrollResize);
      };
    }
  }, [isVisible]);

  return (
    <div
      ref={childRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible &&
        ReactDOM.createPortal(
          <div
            className="fixed px-2 py-1 bg-gray-700 dark:bg-zinc-800
                       border border-gray-600 dark:border-zinc-700
                       text-gray-100 text-sm rounded-lg whitespace-nowrap z-50
                       transform -translate-y-1/2"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
          >
            {content}
          </div>,
          document.body
        )}
    </div>
  );
};
