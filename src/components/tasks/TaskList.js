import { AnimatePresence, motion } from "framer-motion";

export default function TaskList({ toggleUnderline, tasks, setTasks }) {
  return (
    <ul className="mb-4 flex flex-col justify-center">
      <AnimatePresence>
        {tasks.length > 0 &&
          tasks.map((task) => (
            <motion.li
              key={task.id}
              initial={{ opacity: 0, y: -30, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 5, height: 0 }}
              transition={{ duration: 0.1 }}
              className={`my-3 flex w-80 items-center justify-between rounded-md ${
                task.style === "underline"
                  ? "border-l-4 border-l-green-600"
                  : "border-l-4 border-l-red-600"
              } bg-gray-200 px-8 py-3 text-xl font-medium text-black`}
              style={{ overflow: "hidden" }}
              whileHover={{ scale: 1.05 }}
            >
              <p
                className="mr-10 cursor-pointer truncate text-2xl"
                style={{
                  textDecoration:
                    task.style === "underline" ? "line-through" : "none",
                }}
                onClick={() => toggleUnderline(task.id)}
              >
                {task.text}
              </p>

              <button
                onClick={() => {
                  setTasks(tasks.filter((a) => a.id !== task.id));
                }}
                aria-label="Delete task"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 16 12"
                >
                  <path
                    fill="none"
                    stroke="black"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5"
                  />
                </svg>
              </button>
            </motion.li>
          ))}
      </AnimatePresence>
    </ul>
  );
}
