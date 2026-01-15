import { createContext, useContext } from "react";

// Define the type for the global content
export type GlobalContent = {
  stop: boolean;
  setStop: (c: boolean) => void;
};

// Create the context with a default value
export const StopTextGeneration = createContext<GlobalContent>({
  stop: false,
  setStop: () => {},
});

// Create a custom hook to access the context
export const useStopTextGeneration = () => useContext(StopTextGeneration);
