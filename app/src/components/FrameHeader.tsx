import Modal from "./ModalBox";
import { FiMinus } from "react-icons/fi";
import { MdCheckBoxOutlineBlank } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";

interface FrameHeaderProps {
  children: React.ReactNode;
}

export const FrameHeader: React.FC<FrameHeaderProps> = ({ children }) => {
  // for controling the window
  const minimize = () => {
    window.ipcRenderer.send("minimize");
  };

  const maximize = () => {
    window.ipcRenderer.send("maximize");
  };

  const close = () => {
    window.ipcRenderer.send("close");
  };

  return (
    <div
      className="w-full h-screen flex flex-col bg-secondary dark:bg-secondary-dark
                font-dmsans"
    >
      {/* ------ Frame Header ------- */}
      <div className="w-full h-[30px] flex justify-end items-center text-gray-200">
        <div
          className="draggable-element
            w-full h-full flex justify-center items-center"
        >
          PINAC Workspace
        </div>
        <div className="w-39 h-full grid grid-cols-3">
          <button
            className="flex justify-center items-center outline-none hover:bg-gray-700 dark:hover:bg-zinc-800"
            onClick={minimize}
          >
            <FiMinus size={17} />
          </button>
          <button
            className="flex justify-center items-center outline-none hover:bg-gray-700 dark:hover:bg-zinc-800"
            onClick={maximize}
          >
            <MdCheckBoxOutlineBlank size={15} />
          </button>
          <button
            className="flex justify-center items-center outline-none hover:bg-red-700"
            onClick={close}
          >
            <RxCross2 size={17} />
          </button>
        </div>
      </div>
      {/* ------ Modal ------- */}
      <Modal />
      {/* ------ Children ------- */}
      {children}
    </div>
  );
};
