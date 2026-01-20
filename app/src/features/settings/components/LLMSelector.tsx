import React, { useState } from "react";
import { DropdownMenu } from "./DropdownMenu";
import { useModelContext } from "../../../contexts";

export const LLMSelector: React.FC = () => {
  const model = useModelContext();
  const [ollamaModelList, setOllamaModelList] = useState([]);
  //
  // -------------------------------- //
  return (
    <div className="w-full flex flex-col gap-4">
      {/*     Dropdown menu for selecting the LLM type   */}
      {/* ---------------------------------------------- */}
      <DropdownMenu
        defaultOption="Pinac Cloud Model"
        optionList={["Pinac Cloud Model", "Ollama Model"]}
        valueName="model-type"
      />
      {/*    for selecting the LLM Name    */}
      {/* -------------------------------- */}
      {model.modelType === "Pinac Cloud Model" ? (
        <DropdownMenu
          defaultOption="Base Model"
          optionList={["Base Model"]}
          valueName="pinac-cloud-model"
        />
      ) : (
        <DropdownMenu
          defaultOption={null}
          optionList={ollamaModelList}
          valueName="ollama-model"
        />
      )}
    </div>
  );
};
