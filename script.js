// Wait until the entire HTML document is fully loaded
document.addEventListener('DOMContentLoaded', function () {
     // Input field for new task text
    const taskInput = document.getElementById('new-task');

    // Button to add a task
    const addBtn = document.getElementById('add-btn');

    // Container where all tasks will be rendered
    const taskList = document.getElementById('task-list');

     // Filter buttons: All / Active / Completed
    const filterButtons = document.querySelectorAll('.filter-btn');

    // Stats elements
    const totalTasksEl = document.getElementById('total-tasks');
    const completedTasksEl = document.getElementById('completed-tasks');
    const themeButtons = document.querySelectorAll('.theme-btn');

    // Priority selection elements
    const priorityOptions = document.querySelectorAll('.priority-option');
    const modeToggle = document.getElementById('mode-toggle');// Dark mode toggle button
    const prioritySelector = document.getElementById('priority-selector');
    const prioritySlider = document.getElementById('priority-slider');

    // Due date & time inputs
    const taskDateInput = document.getElementById('task-date');
    const taskTimeInput = document.getElementById('task-time');


    // Load tasks from localStorage or initialize empty array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Current UI state
    let currentFilter = 'all';
    let currentPriority = 'medium';
    let currentTheme = 'purple-blue';

    // Dark mode preference (default true)
    let darkMode = localStorage.getItem('darkMode') != 'false';


    // Default RGB values used for glow and gradients
    document.documentElement.style.setProperty('--primary-rgb', '138, 43, 226');
    document.documentElement.style.setProperty('--secondary-rgb', '0, 198, 251');
    document.documentElement.style.setProperty('--success-rgb', '0, 230, 118');
    document.documentElement.style.setProperty('--danger-rgb', '255, 77, 77');

     // Initializes the app on page load

    function init(){
        setTheme(darkMode?'dark':'light');
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');

        taskDateInput.value = today;
        taskTimeInput.value = time;

        renderTasks();
        updateStats();
        setupEventListeners();
        updatePrioritySlider();

        setTimeout(()=>{
            prioritySelector.style.transform = 'scale(1.05)';
            setTimeout(()=>{
                prioritySelector.style.transform = 'scale(1)';
            }, 300);
        }, 500);
    }

    // Set today's date and current time as default values
    function updatePrioritySlider(){
        const selectedOption = document.querySelector('.priority-option.selected');
        if(selectedOption){
            const optionRect = selectedOption.getBoundingClientRect();
            const containerRect = prioritySelector.getBoundingClientRect();
            const left = optionRect.left - containerRect.left - 3;
            prioritySlider.style.transform = `translateX(${left}px)`;

            let color;
            switch (currentPriority){
                case 'high': color='var(--high-priority)'; break;
                case 'medium': color='var(--medium-priority)'; break;
                case 'low': color='var(--low-priority)'; break;
            }
            prioritySlider.style.boxShadow = `0 0 10px ${color}`;
        }
    }

    // Attaches all UI event listeners
    function setupEventListeners(){
        addBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e){
            if(e.key === 'Enter') addTask();
        });

        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });

        themeButtons.forEach(button => {
            button.addEventListener('click', function(){
                themeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentTheme = this.dataset.theme;
                applyColorTheme(currentTheme);
            });
        });

        priorityOptions.forEach(option => {
            option.addEventListener('click', function(){
                priorityOptions.forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
                currentPriority = this.dataset.priority.toLowerCase();
                updatePrioritySlider();

                this.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    this.style.transform = 'scale(1.05)';
                }, 200);
            });
        });

        modeToggle.addEventListener('click', toggleDarkMode);
        window.addEventListener('resize', updatePrioritySlider);
    }

     // Toggles dark and light mode
    function toggleDarkMode(){
        darkMode = !darkMode;
        localStorage.setItem('darkMode', darkMode);
        setTheme(darkMode ? 'dark' : 'light');

        modeToggle.style.transform = 'scale(1.2) rotate(180deg)';
        setTimeout(() => {
            modeToggle.style.transform = 'scale(1) rotate(0)';
        }, 300);
    }

    // Applies dark or light theme

    function setTheme(theme){
        document.documentElement.setAttribute('data-theme', theme);
        modeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        modeToggle.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }

    // Applies color theme by updating CSS variables
    function applyColorTheme(theme){
        let primary, primaryDark, secondary;

        switch(theme){
            case 'purple-blue':
                primary = '#8a2be2'; primaryDark = '#5f1d9e'; secondary = '#00c6fb'; break;
            case 'red-yellow':
                primary = '#ff4d4d'; primaryDark = '#d63032'; secondary = '#e63031'; break;
            case 'purple-pink':
                primary = '#c151c1'; primaryDark = '#fd79e8'; secondary = '#ffdbe9'; break;
            case 'orange-yellow':
                primary = '#e17055'; primaryDark = '#d63031'; secondary = '#fdcb6e'; break;
            case 'green-blue':
                primary = '#00b894'; primaryDark = '#5f1d9e'; secondary = '#00c6fb'; break;
            default:
                primary = '#8a2be2'; primaryDark = '#5f1d9e'; secondary = '#00c6fb'; 
        }

        document.documentElement.style.setProperty('--primary', primary);
        document.documentElement.style.setProperty('--primary-dark', primaryDark);
        document.documentElement.style.setProperty('--secondary', secondary);

        const primaryRgb = hexToRgb(primary).join(', ');
        const secondaryRgb = hexToRgb(secondary).join(', ');
        document.documentElement.style.setProperty('--primary-rgb', primaryRgb);
        document.documentElement.style.setProperty('--secondary-rgb', secondaryRgb);

        updatePrioritySlider();

        function hexToRgb(hex){
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return [r, g, b];
        }
    }

    // Adds a new task to the list
    function addTask(){
        const taskText = taskInput.value.trim();
        if(taskText === ''){
            animateInputError();
            return;
        }

        const date = taskDateInput.value;
        const time = taskTimeInput.value;
        let formattedDate = '';

        if(date){
            const dateObj = new Date(date);
            formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });

            if(time){
                const [hours, minutes] = time.split(':');
                dateObj.setHours(parseInt(hours));
                dateObj.setMinutes(parseInt(minutes));
                formattedDate += ` at ${time}`;
            }
        }

        const newtask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            priority: currentPriority,
            createdAt: new Date(),
            dueDate: date,
            dueTime: time,
            formattedDate: formattedDate,
        };

        tasks.unshift(newtask);
        saveTasks();
        renderTasks();
        updateStats();
        taskInput.value = '';
        taskInput.focus();

        setTimeout(() => {
            const taskElement = document.querySelector(`[data-id="${newtask.id}"]`);
            if(taskElement){
                taskElement.classList.add('task-enter');
                setTimeout(() => {
                    taskElement.classList.remove('task-enter');
                }, 500);
            }
        }, 10);

        addBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            addBtn.style.transform = 'scale(1)';
        }, 150);
    }

    // Animates input box when empty task is submitted
    function animateInputError(){
        taskInput.style.borderColor = "var(--danger)";
        taskInput.animate([
            {transform: 'translateX(0)'},
            {transform: 'translateX(-5px)'},
            {transform: 'translateX(5px)'},
            {transform: 'translateX(0)'}
        ], {
            duration: 100,
            iterations: 3
        });

        setTimeout(() => {
            taskInput.style.borderColor = 'var(--card-border)';
        }, 1000);
    }

    // Renders tasks based on current filter
    function renderTasks(){
        taskList.innerHTML = '';

        let filteredTasks = tasks;
        if(currentFilter === 'active'){
            filteredTasks = tasks.filter(task => !task.completed);
        } else if(currentFilter === 'completed'){
            filteredTasks = tasks.filter(task => task.completed);
        }

        if(filteredTasks.length === 0){
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-state';

            if(currentFilter === 'all'){
                emptyMessage.innerHTML = `<i class="fas fa-tasks"></i><h3>No task yet!</h3><p>Add your first task to get started</p>`;
            } else if(currentFilter === 'active'){
                emptyMessage.innerHTML = `<i class="fas fa-clock"></i><h3>No active tasks</h3><p>You're doing great!</p>`;
            } else {
                emptyMessage.innerHTML = `<i class="fas fa-check-circle"></i><h3>No completed tasks</h3><p>Complete some tasks to see them here</p>`;
            }

            taskList.appendChild(emptyMessage);
            return;
        }

        filteredTasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = `task ${task.completed ? 'completed' : ''}`;
            taskElement.dataset.id = task.id;

            const priorityClass = `priority-${task.priority}`;
            const priorityIndicator = `<div class="priority-indicator ${priorityClass}"></div>`;

            const dateDisplay = task.formattedDate ? `
                <div class="task-meta">
                    <div class="task-date">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${task.formattedDate}</span>
                    </div>
                </div>` : '';

            taskElement.innerHTML = `
                ${priorityIndicator}
                <label class="checkbox-container">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"><i class ="fas fa-check"></i></span>
                </label>
                <div class="task-content">
                    ${task.text}
                    ${dateDisplay}
                </div>
                <div class="task-actions">
                    <button class="task-btn complete-btn" title="${task.completed ? 'Mark as incomplete' : 'Mark as completed'}">
                        <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button class="task-btn delete-btn" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>`;

            taskList.appendChild(taskElement);

            const checkbox = taskElement.querySelector('input[type="checkbox"]');
            const completeBtn = taskElement.querySelector('.complete-btn');
            const deleteBtn = taskElement.querySelector('.delete-btn');

            checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
            completeBtn.addEventListener('click', () => toggleTaskComplete(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
        });
    }

    // Toggles completion state of a task
    function toggleTaskComplete(taskId){
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if(taskIndex === -1) return;

        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        renderTasks();
        updateStats();
    }

    // Deletes a task permanently
    function deleteTask(taskId){
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
        updateStats();
    }

     // Updates total and completed task counts
    function updateStats(){
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;

        totalTasksEl.textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;
        completedTasksEl.textContent = `${completedTasks} completed`;
    }

    // Saves tasks to localStorage
    function saveTasks(){
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Start the app
    init();
});
