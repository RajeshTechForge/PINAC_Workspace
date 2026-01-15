//@ts-nocheck
import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Prism from "prismjs";
import "prismjs/themes/prism-solarizedlight.css";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useStopTextGeneration } from "../context/StopTextGeneration";

// Import common languages
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-go";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";

// Icons
import { FiCopy } from "react-icons/fi";
import { FaCheck } from "react-icons/fa6";

const MAX_LENGTH_FOR_SPECIAL_BOLD_STYLE = 120;

// Custom syntax highlighter component
const CustomSyntaxHighlighter: React.FC<{
  language: string;
  children: string;
  showLineNumbers?: boolean;
}> = ({ language, children, showLineNumbers = true }) => {
  const [highlightedCode, setHighlightedCode] = useState("");

  useEffect(() => {
    try {
      const highlighted = Prism.highlight(
        children,
        Prism.languages[language] || Prism.languages.text,
        language
      );
      setHighlightedCode(highlighted);
    } catch (error) {
      setHighlightedCode(children);
    }
  }, [children, language]);

  const lines = children.split("\n");

  return (
    <div className="w-full overflow-hidden relative">
      <pre className="bg-transparent dark:bg-secondary-dark text-gray-800 dark:text-gray-300 border border-gray-300 dark:border-none p-4 mb-10 rounded-b-lg overflow-x-auto text-sm font-mono">
        <code>
          {showLineNumbers ? (
            <div className="flex">
              <div className="select-none text-gray-500 pr-4 text-right min-w-[2rem]">
                {lines.map((_, index) => (
                  <div key={index}>{index + 1}</div>
                ))}
              </div>
              <div
                className="flex-1"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
          )}
        </code>
      </pre>
    </div>
  );
};

interface LiveMarkdownRendererProps {
  text: string;
  setButtonsDisabled?: React.Dispatch<React.SetStateAction<boolean>> | null;
}

export const LiveMarkdownRenderer: React.FC<LiveMarkdownRendererProps> = ({
  text,
  setButtonsDisabled,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const { stop, setStop } = useStopTextGeneration();
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Reset rendering when text changes completely
  useEffect(() => {
    if (text !== displayText && currentIndex === 0) {
      setDisplayText("");
    }
  }, [text]);

  // Handle typing effect for the entire Markdown content
  useEffect(() => {
    // If we're at the end of the text or very close to it
    if (currentIndex >= text.length) {
      if (!isComplete) {
        setIsComplete(true);
        setButtonsDisabled && setButtonsDisabled(false);
      }
      return;
    }

    // If stop is requested
    if (stop) {
      setButtonsDisabled && setButtonsDisabled(false);
      setStop(false);
      setIsComplete(true);
      setDisplayText(text); // Show full text when stopped
      return;
    }

    // Continue rendering
    setDisplayText((prevText) => prevText + text[currentIndex]);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  }, [currentIndex, text, stop, isComplete]);

  // If text has changed, reset the current index and complete status
  useEffect(() => {
    if (text !== displayText && displayText.length >= text.length) {
      setCurrentIndex(0);
      setDisplayText("");
      setIsComplete(false);
    }
  }, [text]);

  return (
    <div className="markdown-content selection:bg-blue-500 selection:text-white">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-gray-800 dark:text-gray-200 font-cormorant text-3xl lg:text-4xl font-bold mt-8 mb-6 pb-3 border-b border-gray-300 dark:border-zinc-700"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-gray-800 dark:text-gray-200 font-cormorant text-3xl font-bold mt-10 mb-5 pb-2.5 border-b border-gray-300 dark:border-zinc-700"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-gray-800 dark:text-gray-200 font-cormorant text-3xl font-bold mt-6 mb-4 pb-2 border-b border-gray-300 dark:border-zinc-700"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-gray-800 dark:text-gray-200 font-cormorant text-3xl font-bold mt-6 mb-4 pb-2 border-b border-gray-300 dark:border-zinc-700"
              {...props}
            />
          ),
          p: ({ node, ...props }) => {
            // Check if the paragraph node has children and the first child is a 'strong' element,
            // and it's the *only* child of the paragraph and the 'strong' element itself only contains text.
            if (
              node &&
              node.children &&
              node.children.length === 1 &&
              node.children[0].type === "element" &&
              node.children[0].tagName === "strong" &&
              node.children[0].children &&
              node.children[0].children.length === 1 &&
              node.children[0].children[0].type === "text"
            ) {
              const boldTextContent = node.children[0].children[0].value;
              if (boldTextContent.length <= MAX_LENGTH_FOR_SPECIAL_BOLD_STYLE) {
                return (
                  <p
                    className="text-gray-800 dark:text-gray-200 font-ptserif-bold text-2xl mt-6 mb-4 pb-2 border-b border-gray-300 dark:border-zinc-700"
                    {...props}
                  />
                );
              }
            }
            // Default paragraph style
            return <p className="" {...props} />;
          },
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 my-5 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />
          ),
          li: ({ node, ...props }) => <li className="mb-1.5" {...props} />,
          a: ({ node, ...props }) => (
            <a
              className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-150"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr
              className="my-10 border-gray-300 dark:border-zinc-700"
              {...props}
            />
          ),
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <>
                <div className="w-full pr-3 flex justify-between bg-gray-200 dark:bg-tertiary-dark/70 text-gray-700 dark:text-gray-200 mt-10 rounded-t-lg">
                  <span className="text-sm font-mono px-2 py-1">
                    {match[1]}
                  </span>
                  <CopyToClipboard text={String(children)} onCopy={handleCopy}>
                    <button className="m-0.5 px-1.5 py-0.5 flex hover:bg-gray-300 dark:hover:bg-neutral-600/60 rounded-sm cursor-pointer">
                      <span className="flex items-center justify-center mr-1">
                        {isCopied ? (
                          <FaCheck className="size-3" />
                        ) : (
                          <FiCopy className="size-3" />
                        )}
                      </span>
                      <span className="text-sm">
                        {isCopied ? "Copied" : "Copy"}
                      </span>
                    </button>
                  </CopyToClipboard>
                </div>
                <CustomSyntaxHighlighter
                  language={match[1]}
                  showLineNumbers={true}
                >
                  {String(children).replace(/\n$/, "")}
                </CustomSyntaxHighlighter>
              </>
            ) : (
              <code
                className="px-1.5 bg-gray-300/50 dark:bg-tertiary-dark/50 rounded-sm font-normal"
                {...props}
              >
                {children}
              </code>
            );
          },
          // for tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-8">
              <table
                className="w-full border-collapse rounded-lg overflow-hidden"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-300 dark:bg-tertiary-dark" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="bg-primary dark:bg-primary-dark " {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr
              className="border-2 border-gray-300 dark:border-zinc-700"
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th className="py-1 px-4 text-left font-bold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td
              className="py-2 px-4 border-2 border-gray-300 dark:border-zinc-700"
              {...props}
            />
          ),
        }}
      >
        {displayText}
      </Markdown>
    </div>
  );
};

//    ================================================     //

interface MarkdownRendererProps {
  text: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="markdown-content selection:bg-blue-500 selection:text-white">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1
              className="text-gray-800 dark:text-gray-200 font-cormorant text-3xl lg:text-4xl font-bold mt-8 mb-6 pb-3 border-b border-gray-300 dark:border-zinc-700"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-gray-800 dark:text-gray-200 font-cormorant text-3xl font-bold mt-10 mb-5 pb-2.5 border-b border-gray-300 dark:border-zinc-700"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-gray-800 dark:text-gray-200 font-cormorant text-3xl font-bold mt-6 mb-4 pb-2 border-b border-gray-300 dark:border-zinc-700"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-gray-800 dark:text-gray-200 font-cormorant text-3xl font-bold mt-6 mb-4 pb-2 border-b border-gray-300 dark:border-zinc-700"
              {...props}
            />
          ),
          p: ({ node, ...props }) => {
            // Check if the paragraph node has children and the first child is a 'strong' element,
            // and it's the *only* child of the paragraph and the 'strong' element itself only contains text.
            if (
              node &&
              node.children &&
              node.children.length === 1 &&
              node.children[0].type === "element" &&
              node.children[0].tagName === "strong" &&
              node.children[0].children &&
              node.children[0].children.length === 1 &&
              node.children[0].children[0].type === "text"
            ) {
              const boldTextContent = node.children[0].children[0].value;
              if (boldTextContent.length <= MAX_LENGTH_FOR_SPECIAL_BOLD_STYLE) {
                return (
                  <p
                    className="text-gray-800 dark:text-gray-200 font-ptserif-bold text-2xl mt-6 mb-4 pb-2 border-b border-gray-300 dark:border-zinc-700"
                    {...props}
                  />
                );
              }
            }
            // Default paragraph style
            return <p className="" {...props} />;
          },
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 my-5 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 my-4 space-y-2" {...props} />
          ),
          li: ({ node, ...props }) => <li className="mb-1.5" {...props} />,
          a: ({ node, ...props }) => (
            <a
              className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-150"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr
              className="my-10 border-gray-300 dark:border-zinc-700"
              {...props}
            />
          ),
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <>
                <div className="w-full pr-3 flex justify-between bg-gray-200 dark:bg-tertiary-dark/70 text-gray-700 dark:text-gray-200 mt-10 rounded-t-lg">
                  <span className="text-sm font-mono px-2 py-1">
                    {match[1]}
                  </span>
                  <CopyToClipboard text={String(children)} onCopy={handleCopy}>
                    <button className="m-0.5 px-1.5 py-0.5 flex hover:bg-gray-300 dark:hover:bg-neutral-600/60 rounded-sm cursor-pointer">
                      <span className="flex items-center justify-center mr-1">
                        {isCopied ? (
                          <FaCheck className="size-3" />
                        ) : (
                          <FiCopy className="size-3" />
                        )}
                      </span>
                      <span className="text-sm">
                        {isCopied ? "Copied" : "Copy"}
                      </span>
                    </button>
                  </CopyToClipboard>
                </div>
                <CustomSyntaxHighlighter
                  language={match[1]}
                  showLineNumbers={true}
                >
                  {String(children).replace(/\n$/, "")}
                </CustomSyntaxHighlighter>
              </>
            ) : (
              <code
                className="px-1.5 bg-gray-300/50 dark:bg-tertiary-dark/50 rounded-sm font-normal"
                {...props}
              >
                {children}
              </code>
            );
          },
          // for tables
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-8">
              <table
                className="w-full border-collapse rounded-lg overflow-hidden"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-300 dark:bg-tertiary-dark" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="bg-primary dark:bg-primary-dark " {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr
              className="border-2 border-gray-300 dark:border-zinc-700"
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th className="py-1 px-4 text-left font-bold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td
              className="py-2 px-4 border-2 border-gray-300 dark:border-zinc-700"
              {...props}
            />
          ),
        }}
      >
        {text}
      </Markdown>
    </div>
  );
};
