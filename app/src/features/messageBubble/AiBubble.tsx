import React, { useState, useEffect } from "react";
import {
  LiveMarkdownRenderer,
  MarkdownRenderer,
} from "../../components/MarkdownRenderer";

// Icons
import pinacLogo from "/icon/Round App Logo.svg";
import { FiCopy } from "react-icons/fi";
import { FaCheck } from "react-icons/fa6";
import { BiLike, BiSolidLike, BiDislike, BiSolidDislike } from "react-icons/bi";
import { GrPowerCycle } from "react-icons/gr";

// ============================================================================ //
//                            AI Message Bubble                                 //
// ============================================================================ //

interface AiMsgBubbleProps {
  live: boolean;
  response: string;
  modelName: string;
  setButtonsDisabled?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AiMsgBubble: React.FC<AiMsgBubbleProps> = ({
  live,
  response,
  modelName,
  setButtonsDisabled,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isLike, setIsLike] = useState(false);
  const [isDislike, setIsDislike] = useState(false);

  // Buttons
  const handleLike = () => {
    if (isLike) {
      setIsLike(false);
      setIsDislike(false);
    } else {
      setIsLike(true);
      setIsDislike(false);
    }
  };
  const handleDislike = () => {
    if (isDislike) {
      setIsDislike(false);
      setIsLike(false);
    } else {
      setIsDislike(true);
      setIsLike(false);
    }
  };

  const copyToClipboard = () => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(response)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch((error) => {
          console.error("Failed to copy:", error);
        });
    }
  };

  // ---------------------------------- //
  return (
    <div className="flex justify-start mt-6">
      <div className="size-[35px] mt-1 rounded-full dark:border-[1.5px] dark:border-gray-500 flex justify-center items-center">
        <img src={pinacLogo} />
      </div>
      <div className="w-full px-4 text-base text-black dark:text-gray-200">
        <div className="text-sm text-gray-600 dark:text-gray-500 mb-1">
          {modelName}
        </div>
        {live ? (
          <LiveMarkdownRenderer
            text={response}
            setButtonsDisabled={setButtonsDisabled ? setButtonsDisabled : null}
          />
        ) : (
          <MarkdownRenderer text={response} />
        )}
        <div className="flex gap-1">
          {/*    Copy Button     */}
          <button
            onClick={copyToClipboard}
            className="relative mt-3 p-1.5 flex items-center justify-center group rounded-md border border-gray-300 dark:border-zinc-700"
          >
            <span
              className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-gray-900 bg-gray-300 dark:text-gray-200 dark:bg-tertiary-dark rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
              aria-hidden="true"
            >
              {isCopied ? "Copied!" : "Copy"}
            </span>
            <span className="flex items-center justify-center text-gray-600 dark:text-gray-400">
              {isCopied ? (
                <FaCheck className="size-5" />
              ) : (
                <FiCopy className="size-5" />
              )}
            </span>
          </button>

          {/*    Like & Dislike Buttons     */}
          <div className="flex mt-3 rounded-md border border-gray-300 dark:border-zinc-700">
            <button
              onClick={handleLike}
              className="relative p-1.5 pr-0.5 flex items-center justify-center group"
            >
              <span
                className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-gray-900 bg-gray-300 dark:text-gray-200 dark:bg-tertiary-dark rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                aria-hidden="true"
              >
                Like
              </span>
              <span className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                {isLike ? (
                  <BiSolidLike className="size-5" />
                ) : (
                  <BiLike className="size-5" />
                )}
              </span>
            </button>
            <button
              onClick={handleDislike}
              className="relative p-1.5 pl-1 flex items-center justify-center group rounded-md"
            >
              <span
                className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-gray-900 bg-gray-300 dark:text-gray-200 dark:bg-tertiary-dark rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                aria-hidden="true"
              >
                Dislike
              </span>
              <span className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                {isDislike ? (
                  <BiSolidDislike className="size-5" />
                ) : (
                  <BiDislike className="size-5" />
                )}
              </span>
            </button>
          </div>

          {/*    Regenerate Button     */}
          <button className="relative mt-3 p-1.5 flex items-center justify-center group rounded-md border border-gray-300 dark:border-zinc-700">
            <span
              className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs text-gray-900 bg-gray-300 dark:text-gray-200 dark:bg-tertiary-dark rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
              aria-hidden="true"
            >
              Regenerate
            </span>
            <span className="flex items-center justify-center text-gray-600 dark:text-gray-400">
              <GrPowerCycle className="size-5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================ //
//                        AI Response Loading Animation                         //
// ============================================================================ //

interface AiLoaderProps {
  modelName: string;
}

//
// Component similar to AiMessage and replaced as soon as we have the data.
export const AiLoader: React.FC<AiLoaderProps> = ({ modelName }) => {
  // necessary keyframes and custom styles
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
        @keyframes fade458 {
          from {
            opacity: 1;
          }
          to {
            opacity: 0.25;
          }
        }
      `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Array of 12 bars with their rotation and delay values
  const bars = Array.from({ length: 12 }, (_, i) => ({
    rotation: i * 30,
    delay: i === 0 ? 0 : -(1.1 - i * 0.1),
  }));

  // ---------------------------------- //
  return (
    <div className="flex justify-start mt-6">
      <div className="size-[35px] mt-1 rounded-full dark:border-[1.5px] dark:border-gray-500 flex justify-center items-center">
        <img src={pinacLogo} />
      </div>
      <div className="flex flex-col max-w-md px-4 text-base font-medium text-gray-600 dark:text-gray-300">
        <div className="text-sm text-gray-600 dark:text-gray-500 mb-3">
          {modelName}
        </div>
        <div className="flex">
          <div className="relative size-7 py-5">
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
          <div className="pl-4">thinking...</div>
        </div>
      </div>
    </div>
  );
};
