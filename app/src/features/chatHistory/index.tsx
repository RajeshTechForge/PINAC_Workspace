import { useLiveQuery } from "dexie-react-hooks";
import { db, deleteAllSessions } from "../database/db";
import { SessionCard } from "./components/SessionCard";

// icons
import { CiSearch } from "react-icons/ci";
import { AiOutlineDelete } from "react-icons/ai";
import { GoHistory } from "react-icons/go";

export const ChatHistory: React.FC = () => {
  const sessions = useLiveQuery(
    () => db.chatSessions.orderBy("timestamp").reverse().toArray(),
    []
  );

  const handleDeleteAllSessions = () => {
    deleteAllSessions().catch((error) => {
      console.error("Error deleting all sessions:", error);
    });
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center scrollbar">
      {/*   Header   */}
      <div className="w-full h-[60px] py-[10px] px-5 mt-[1px] flex items-center justify-between text-gray-200">
        <div className="flex items-center justify-between font-normal font-cormorant text-3xl">
          <GoHistory size={25} className="inline-block mr-3" />
          History
        </div>
        <button
          className="p-1.5 hover:bg-zinc-700 rounded-full cursor-pointer"
          onClick={handleDeleteAllSessions}
        >
          <AiOutlineDelete size={25} />
        </button>
      </div>
      {/*   Search Bar   */}
      <div className="w-full py-5 px-3 lg:p-5 flex flex-col items-center">
        <div
          className="w-full h-[40px] flex items-center relative rounded-xl
          bg-gray-700 dark:bg-primary-dark border-[1.5px] border-gray-700 dark:border-zinc-500"
        >
          <CiSearch size={25} className="absolute left-2 text-gray-400" />
          <input
            placeholder="Search"
            type="search"
            className="w-full h-full p-2 pl-10 text-md outline-0 text-gray-100"
          />
        </div>
      </div>
      {/*   Session Cards   */}
      <div className="w-full h-full py-1 px-3 lg:px-5 gap-1.5 flex flex-col items-center justify-start scrollbar">
        {sessions?.length !== 0 ? (
          sessions?.map((session) => (
            <SessionCard
              sessionId={session.id}
              date={`${String(session.timestamp.getDate()).padStart(
                2,
                "0"
              )}.${String(session.timestamp.getMonth() + 1).padStart(
                2,
                "0"
              )}.${String(session.timestamp.getFullYear())}`}
              title={session.title}
              key={session.id}
            />
          ))
        ) : (
          <span className="text-xl">No history</span>
        )}
      </div>
    </div>
  );
};
