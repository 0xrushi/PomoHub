import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import TaskInput from './TaskInput';
import TaskList from './TaskList';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);

  function handleAddTask(e) {
    e.preventDefault();
    const uniqueId = uuidv4();
    
    const newTask = {
      id: uniqueId, // Generate a unique id using uuidv4
      text: e.currentTarget.task.value,
      style: 'none',
    };
    if (newTask.text.trim() !== '') {
      setTasks([newTask, ...tasks]);
      e.currentTarget.task.value = '';
    }
  }

  function toggleUnderline(id) {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            style: task.style === 'underline' ? 'none' : 'underline',
          };
        }
        return task;
      })
    );
  }

  return (
    <section className='flex w-96 flex-col items-center justify-center px-3'>
      <TaskInput handleAddTask={handleAddTask} />
      <TaskList
        toggleUnderline={toggleUnderline}
        tasks={tasks}
        setTasks={setTasks}
      />
    </section>
  );
}
