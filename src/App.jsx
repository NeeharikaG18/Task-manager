import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List as ListIcon, Edit2, Trash2, Save, X, Clock, Tag } from 'lucide-react';

// --- Helper Functions ---

/**
 * Gets a priority color class.
 * @param {string} priority - 'High', 'Medium', or 'Low'
 * @returns {string} Tailwind CSS classes
 */
const getPriorityClasses = (priority) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Low':
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

/**
 * Gets a category color class.
 * Updated for new categories.
 * @param {string} category - 'Personal', 'Work', 'Daily Goals', 'Weekly Goals', 'Monthly Goals'
 * @returns {string} Tailwind CSS classes
 */
const getCategoryClasses = (category) => {
  switch (category) {
    case 'Work':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Personal':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'Daily Goals':
      return 'bg-teal-100 text-teal-800 border-teal-300';
    case 'Weekly Goals':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'Monthly Goals':
      return 'bg-pink-100 text-pink-800 border-pink-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

/**
 * Formats a 24-hour time string (HH:mm) to a 12-hour AM/PM string.
 * @param {string} timeString - e.g., "14:30"
 * @returns {string} - e.g., "2:30 PM"
 */
const formatTime = (timeString) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const date = new Date(0, 0, 0, hours, minutes);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

/**
 * Checks if a task is overdue or due today.
 * @param {string} dueDateString - The due date in "YYYY-MM-DD" format.
 * @returns {{isOverdue: boolean, isDueToday: boolean}}
 */
const getTaskDateStatus = (dueDateString) => {
  if (!dueDateString) {
    return { isOverdue: false, isDueToday: false };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const parts = dueDateString.split('-');
  const dueDate = new Date(parts[0], parts[1] - 1, parts[2]);
  dueDate.setHours(0, 0, 0, 0);

  const isOverdue = dueDate < today;
  const isDueToday = dueDate.getTime() === today.getTime();

  return { isOverdue, isDueToday };
};


// --- Calendar Component ---

/**
 * A component to display a month calendar grid.
 * @param {{tasks: Array<object>, onDateClick: (date: Date) => void, selectedDate: Date}} props
 */
const CalendarView = ({ tasks, onDateClick, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create a set of dates (YYYY-MM-DD) that have tasks
  const taskDates = new Set(tasks.map(task => task.dueDate).filter(Boolean));
  
  // Normalize selected date to midnight for comparison
  const normalizedSelectedDate = selectedDate ? new Date(selectedDate.setHours(0,0,0,0)).getTime() : null;

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const calendarDays = [];
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-start-${i}`} className="h-20 sm:h-24"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(year, month, day);
    dayDate.setHours(0, 0, 0, 0); // Normalize day date
    const dateString = dayDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const hasTasks = taskDates.has(dateString);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday = dayDate.getTime() === today.getTime();
    
    // Check if this day is the selected day
    const isSelected = normalizedSelectedDate && dayDate.getTime() === normalizedSelectedDate;

    calendarDays.push(
      <div
        key={day}
        className={`p-2 border border-gray-200 h-20 sm:h-24 flex flex-col cursor-pointer transition-colors ${
          isToday ? 'bg-blue-50' : ''
        } ${
          isSelected ? 'bg-blue-200 ring-2 ring-blue-300' : 'hover:bg-gray-50'
        }`}
        onClick={() => onDateClick(dayDate)}
      >
        <span className={`font-medium ${isToday ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
          {day}
        </span>
        {hasTasks && (
          <div className="mt-auto flex justify-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          {monthNames[month]} {year}
        </h2>
        <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>
      
      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-px text-center text-sm font-medium text-gray-500 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="hidden sm:block">{day}</div>
        ))}
        {daysOfWeek.map(day => (
          <div key={day} className="sm:hidden">{day.charAt(0)}</div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
        {calendarDays.map((day, index) => (
          <div key={index} className="bg-white">
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};


// --- Main App Component ---

export default function App() {
  
  // --- 1. STATE (Our App's Memory) ---
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('react-task-manager-tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  // State for the form inputs
  const [taskText, setTaskText] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskCategory, setTaskCategory] = useState('Personal'); // Default to Personal
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskStartTime, setTaskStartTime] = useState('');
  const [taskEndTime, setTaskEndTime] = useState('');

  // State for navigation
  const [currentPage, setCurrentPage] = useState('home');
  const [currentFolder, setCurrentFolder] = useState('All'); 

  // State for editing a task
  const [editingTaskId, setEditingTaskId] = useState(null); 
  const [editingTaskText, setEditingTaskText] = useState('');

  // State for the calendar page
  const [selectedDate, setSelectedDate] = useState(new Date());

  // --- 2. LOCALSTORAGE PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('react-task-manager-tasks', JSON.stringify(tasks));
  }, [tasks]); 

  // --- 3. DERIVED STATE ---
  
  // Filter tasks for the selected date on the calendar page
  const tasksForSelectedDay = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate + 'T00:00:00'); // Use UTC
    return taskDate.toDateString() === selectedDate.toDateString();
  });

  // NEW: Filter tasks for today's schedule, sorted by priority then time
  const todayString = new Date().toISOString().split('T')[0];
  const priorityMap = { 'High': 1, 'Medium': 2, 'Low': 3 }; // Map for sorting
  
  const tasksForToday = tasks
    .filter(task => task.dueDate === todayString) // Get today's tasks
    .sort((a, b) => {
      // 1. Sort by priority
      const priorityA = priorityMap[a.priority];
      const priorityB = priorityMap[b.priority];
      if (priorityA !== priorityB) {
        return priorityA - priorityB; // High (1) comes before Low (3)
      }
      
      // 2. If priorities are equal, sort by start time
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      if (a.startTime) return -1; // Tasks with time come first
      if (b.startTime) return 1;
      return 0; // Keep original order if no times
  });

  // Filter tasks for the selected folder on the home page
  const filteredTasks = tasks.filter(task => {
    if (currentFolder === 'All') {
      return true; // Show all tasks
    }
    return task.category === currentFolder;
  });

  // --- 4. FUNCTIONS (Our App's Logic) ---

  /**
   * CREATE: Called when you submit the form to add a new task.
   */
  const handleAddTask = (e) => {
    e.preventDefault();
    if (taskText.trim() === '') return;
    
    const newTask = {
      id: Date.now(),
      text: taskText,
      priority: taskPriority,
      category: taskCategory, // Save category
      dueDate: taskDueDate,
      startTime: taskStartTime,
      endTime: taskEndTime,
      completed: false
    };
    
    setTasks([newTask, ...tasks]);
    
    // Reset form fields
    setTaskText('');
    setTaskPriority('Medium');
    setTaskCategory('Personal'); // Reset category
    setTaskDueDate('');
    setTaskStartTime('');
    setTaskEndTime('');
  };

  const handleDeleteTask = (taskIdToDelete) => {
    setTasks(tasks.filter((task) => task.id !== taskIdToDelete));
  };

  const handleToggleComplete = (taskIdToToggle) => {
    setTasks(tasks.map((task) => 
      task.id === taskIdToToggle ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditingTaskText('');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault(); 
    setTasks(tasks.map((task) => 
      task.id === editingTaskId ? { ...task, text: editingTaskText } : task
    ));
    setEditingTaskId(null);
    setEditingTaskText('');
  };
  
  // --- 5. JSX (What You See on the Screen) ---
  
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-inter">
      
      {/* --- Sidebar --- */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r border-gray-200 flex-shrink-0">
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold text-gray-800">
            Task Manager
          </h1>
        </div>
        
        {/* Main Nav */}
        <nav className="flex flex-row md:flex-col p-4 md:p-6 md:space-y-2 justify-center md:justify-start">
          <button
            onClick={() => setCurrentPage('home')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors w-full ${
              currentPage === 'home'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ListIcon size={20} />
            <span>Home</span>
          </button>
          <button
            onClick={() => setCurrentPage('calendar')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors w-full ${
              currentPage === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <CalendarIcon size={20} />
            <span>Calendar</span>
          </button>
        </nav>
        
        {/* --- Folders --- */}
        <div className="p-4 md:p-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Folders
          </h3>
          <div className="flex flex-row flex-wrap md:flex-col gap-2">
            {[
              { name: 'All', color: 'blue' },
              { name: 'Personal', color: 'purple' },
              { name: 'Work', color: 'blue' },
              { name: 'Daily Goals', color: 'teal' },
              { name: 'Weekly Goals', color: 'indigo' },
              { name: 'Monthly Goals', color: 'pink' },
            ].map((folder) => (
              <button
                key={folder.name}
                onClick={() => {
                  setCurrentFolder(folder.name);
                  setCurrentPage('home'); // Switch to home page when a folder is clicked
                }}
                className={`text-left w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentFolder === folder.name && currentPage === 'home' // Highlight only if on home page
                    ? `bg-${folder.color}-100 text-${folder.color}-800`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={`w-2 h-2 bg-${folder.color}-500 rounded-full`}></span>
                <span>{folder.name}</span>
              </button>
            ))}
            {/* Tailwind JIT compiler needs to see these full class names */}
            <span className="hidden bg-blue-100 text-blue-800 bg-blue-500"></span>
            <span className="hidden bg-purple-100 text-purple-800 bg-purple-500"></span>
            <span className="hidden bg-teal-100 text-teal-800 bg-teal-500"></span>
            <span className="hidden bg-indigo-100 text-indigo-800 bg-indigo-500"></span>
            <span className="hidden bg-pink-100 text-pink-800 bg-pink-500"></span>
          </div>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-grow p-4 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          
          {/*
            PAGE 1: HOME (Task List)
          */}
          {currentPage === 'home' && (
            <div>
              {/* --- Today's Schedule --- */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                  Today's Schedule ({new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })})
                </h2>
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                  {tasksForToday.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No tasks scheduled for today. Add some!</p>
                  ) : (
                    <ul className="space-y-4">
                      {tasksForToday.map(task => (
                        <li 
                          key={task.id} 
                          className={`flex items-center gap-3 sm:gap-4 p-4 rounded-lg border ${
                            task.completed ? 'opacity-60 bg-gray-50' : 'bg-white'
                          }`}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={() => handleToggleComplete(task.id)}
                            className={`flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all ${
                              task.completed 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'border-gray-400 hover:border-gray-600'
                            }`}
                            title={task.completed ? "Mark as incomplete" : "Mark as done"}
                          >
                            {task.completed && (
                              <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          
                          {/* Time */}
                          <div className="flex-shrink-0 w-20 sm:w-28 text-sm font-semibold text-blue-700">
                            {formatTime(task.startTime) || <span className="text-gray-400 font-medium">All Day</span>}
                          </div>
                          
                          {/* Task Info */}
                          <div className="flex-grow">
                            <span className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                              {task.text}
                            </span>
                          </div>
                          
                          {/* Priority Badge */}
                          <span
                            className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${getPriorityClasses(task.priority)}`}
                          >
                            <Tag size={12} />
                            {task.priority}
                          </span>

                          {/* Category Badge */}
                          <span
                            className={`flex-shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full border ${getCategoryClasses(task.category)}`}
                          >
                            {task.category}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* --- CREATE Form --- */}
              <form onSubmit={handleAddTask} className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">Add New Task</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Task Text Input */}
                  <input
                    type="text"
                    className="md:col-span-3 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What do you need to do?"
                    value={taskText}
                    onChange={(e) => setTaskText(e.target.value)}
                  />
                  
                  {/* Priority Select */}
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-600 mb-1">Priority</label>
                    <select
                      id="priority"
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  
                  {/* NEW Category Select */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                    <select
                      id="category"
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={taskCategory}
                      onChange={(e) => setTaskCategory(e.target.value)}
                    >
                      <option>Personal</option>
                      <option>Work</option>
                      <option>Daily Goals</option>
                      <option>Weekly Goals</option>
                      <option>Monthly Goals</option>
                    </select>
                  </div>
                  
                  {/* Due Date Input */}
                  <div>
                    <label htmlFor="duedate" className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
                    <input
                      type="date"
                      id="duedate"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                    />
                  </div>
                  
                  {/* Start Time Input */}
                  <div>
                    <label htmlFor="starttime" className="block text-sm font-medium text-gray-600 mb-1">Start Time</label>
                    <input
                      type="time"
                      id="starttime"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={taskStartTime}
                      onChange={(e) => setTaskStartTime(e.target.value)}
                    />
                  </div>
                  
                  {/* End Time Input */}
                  <div>
                    <label htmlFor="endtime" className="block text-sm font-medium text-gray-600 mb-1">End Time</label>
                    <input
                      type="time"
                      id="endtime"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={taskEndTime}
                      onChange={(e) => setTaskEndTime(e.target.value)}
                    />
                  </div>
                  
                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="md:col-span-3 bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                  >
                    Add Task
                  </button>
                </div>
              </form>

              {/* --- READ (Task List) --- */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                  {currentFolder} Tasks
                </h2>
                {filteredTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 bg-white rounded-xl shadow-lg border border-gray-200">
                    No tasks {currentFolder === 'All' ? '' : `in ${currentFolder}`}.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {filteredTasks.map((task) => {
                      const { isOverdue, isDueToday } = getTaskDateStatus(task.dueDate);
                      const reminderClass = isOverdue ? 'border-red-500' : (isDueToday ? 'border-blue-500' : 'border-gray-200');

                      return (
                        <li
                          key={task.id}
                          className={`bg-white rounded-xl shadow-lg overflow-hidden border ${
                            task.completed ? 'opacity-60' : ''
                          } ${
                            editingTaskId === task.id ? 'border-blue-500 ring-2 ring-blue-300' : reminderClass
                          }`}
                        >
                          {/* --- Edit View --- */}
                          {editingTaskId === task.id ? (
                            <form onSubmit={handleSaveEdit} className="p-6 flex items-center gap-2">
                              <input
                                type="text"
                                className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={editingTaskText}
                                onChange={(e) => setEditingTaskText(e.target.value)}
                              />
                              <button type="submit" className="p-2 text-green-600 hover:bg-green-100 rounded-full">
                                <Save size={18} />
                              </button>
                              <button type="button" onClick={handleCancelEdit} className="p-2 text-red-600 hover:bg-red-100 rounded-full">
                                <X size={18} />
                              </button>
                            </form>
                          
                          /* --- Normal View --- */
                          ) : (
                            <div className="p-6">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex-grow flex items-center gap-4">
                                  {/* Checkbox */}
                                  <button
                                    onClick={() => handleToggleComplete(task.id)}
                                    className={`flex-shrink-0 w-6 h-6 rounded-md border-2 transition-all ${
                                      task.completed 
                                        ? 'bg-blue-600 border-blue-600' 
                                        : 'border-gray-400 hover:border-gray-600'
                                    }`}
                                    title={task.completed ? "Mark as incomplete" : "Mark as done"}
                                  >
                                    {task.completed && (
                                      <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </button>
                                  {/* Task Text */}
                                  <span
                                    className={`text-lg font-medium ${
                                      task.completed ? 'line-through text-gray-500' : 'text-gray-800'
                                    }`}
                                  >
                                    {task.text}
                                  </span>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex-shrink-0 flex items-center gap-2">
                                  <button
                                    onClick={() => handleStartEdit(task)}
                                    className="p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 rounded-full"
                                    title="Edit task"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 rounded-full"
                                    title="Delete task"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>

                              {/* --- Task Meta Info (Priority, Date, Time) --- */}
                              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                                {/* Priority Badge */}
                                <span
                                  className={`inline-flex items-center gap-1.5 text-sm font-medium px-2.5 py-0.5 rounded-full border ${getPriorityClasses(task.priority)}`}
                                >
                                  <Tag size={14} />
                                  {task.priority}
                                </span>
                                
                                {/* Category Badge */}
                                <span
                                  className={`inline-flex items-center gap-1.5 text-sm font-medium px-2.5 py-0.5 rounded-full border ${getCategoryClasses(task.category)}`}
                                >
                                  <Tag size={14} />
                                  {task.category || 'N/A'}
                                </span>
                                
                                {/* Due Date */}
                                {task.dueDate && (
                                  <span className={`flex items-center gap-1.5 text-sm font-medium text-gray-600 ${isOverdue ? 'text-red-600 font-bold' : ''} ${isDueToday ? 'text-blue-600 font-bold' : ''}`}>
                                    <CalendarIcon size={14} />
                                    {isOverdue ? 'Overdue: ' : (isDueToday ? 'Due Today: ' : '')}
                                    {new Date(task.dueDate + 'T00:00:00').toLocaleDateString(undefined, { timeZone: 'UTC' })}
                                  </span>
                                )}
                                
                                {/* Time Period */}
                                {(task.startTime || task.endTime) && (
                                  <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                                    <Clock size={14} />
                                    {formatTime(task.startTime)}{task.startTime && task.endTime ? ' - ' : ''}{formatTime(task.endTime)}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          )}
          
          {/*
            PAGE 2: CALENDAR
          */}
          {currentPage === 'calendar' && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <CalendarView
                tasks={tasks}
                selectedDate={selectedDate}
                onDateClick={setSelectedDate} // Update selected date on click
              />
              
              {/* --- Task List for Selected Day --- */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Tasks for {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                {tasksForSelectedDay.length === 0 ? (
                  <p className="text-gray-500">No tasks for this day.</p>
                ) : (
                  <ul className="space-y-3">
                    {tasksForSelectedDay.map(task => (
                      <li key={task.id} className={`p-4 rounded-lg border flex items-center gap-4 ${task.completed ? 'bg-gray-50 opacity-70' : 'bg-white'}`}>
                        <button
                          onClick={() => handleToggleComplete(task.id)}
                          className={`flex-shrink-0 w-5 h-5 rounded-md border-2 transition-all ${
                            task.completed 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'border-gray-400 hover:border-gray-600'
                          }`}
                        >
                          {task.completed && (
                            <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <div className="flex-grow">
                          <span className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.text}
                          </span>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mt-1">
                            {/* Time Period */}
                            {(task.startTime || task.endTime) && (
                              <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {formatTime(task.startTime)}{task.startTime && task.endTime ? ' - ' : ''}{formatTime(task.endTime)}
                              </span>
                            )}
                            {/* Priority */}
                            <span className={`flex items-center gap-1.5 font-medium ${getPriorityClasses(task.priority).replace('bg-', 'text-')}`}>
                              <Tag size={14} />
                              {task.priority}
                            </span>
                            {/* Category */}
                            <span className={`flex items-center gap-1.5 font-medium ${getCategoryClasses(task.category).replace('bg-', 'text-')}`}>
                              <Tag size={14} />
                              {task.category || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
          
        </div>
      </main>

    </div>
  );
}

