
export default function TaskInput({
  handleAddTask,
}) {
  return (
    <form onSubmit={handleAddTask} className='mb-2 flex w-full items-center'>
      <fieldset className='w-full rounded-lg border-4 border-gray-100'>
        <legend className='px-2 text-center text-2xl font-black uppercase'>
          Tasks
        </legend>
        <div className='flex w-full items-center justify-center p-2'>
          <input
            className='w-full bg-transparent text-lg font-semibold outline-none'
            type='text'
            name='task'
            autoFocus
            aria-label='Task name'
          />
          <button
            type='submit'
            aria-label='Add task'
            className='pointer active:translate-y-0.5'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='32'
              height='32'
              viewBox='0 0 24 24'
            >
              <path
                fill='currentColor'
                d='M19 6a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1H7.41l1.3-1.29a1 1 0 0 0-1.42-1.42l-3 3a1 1 0 0 0-.21.33a1 1 0 0 0 0 .76a1 1 0 0 0 .21.33l3 3a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.42L7.41 14H17a3 3 0 0 0 3-3V7a1 1 0 0 0-1-1Z'
              />
            </svg>
          </button>
        </div>
      </fieldset>
    </form>
  );
}
