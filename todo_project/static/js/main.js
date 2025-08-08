document.addEventListener('DOMContentLoaded', () => {

    // --- CSRF Setup for Axios ---
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    axios.defaults.headers.common['X-CSRFToken'] = csrfToken;
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    // --- DOM Elements ---
    const todoList = document.getElementById('todo-list');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const todoModal = new bootstrap.Modal(document.getElementById('todo-modal'));
    const todoModalLabel = document.getElementById('todo-modal-label');
    const saveTodoBtn = document.getElementById('save-todo-btn');
    const todoForm = document.getElementById('todo-form');
    const todoIdInput = document.getElementById('todo-id');
    const todoTitleInput = document.getElementById('todo-title-input');

    // --- Functions ---

    /**
     * Renders the list of todos
     * @param {Array} todos - Array of todo objects
     */
    const renderTodos = (todos) => {
        todoList.innerHTML = '';
        if (todos.length === 0) {
            todoList.innerHTML = '<li class="list-group-item text-center">No todos yet.</li>';
            return;
        }
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `list-group-item todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;

            li.innerHTML = `
                <div class="d-flex align-items-center">
                    <input class="form-check-input me-3 complete-checkbox" type="checkbox" ${todo.completed ? 'checked' : ''}>
                    <span class="todo-title flex-grow-1">${todo.title}</span>
                </div>
                <div>
                    <button class="btn btn-danger btn-sm delete-btn">Delete</button>
                </div>
            `;

            // Add fade-in animation
            li.style.opacity = '0';
            todoList.appendChild(li);
            setTimeout(() => {
                li.style.opacity = '1';
                li.style.transition = 'opacity 0.3s ease';
            }, 10);
        });
    };

    /**
     * Fetches todos from the server and renders them
     */
    const loadTodos = async () => {
        try {
            const response = await axios.get('/');
            renderTodos(response.data);
        } catch (error) {
            console.error('Error loading todos:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Could not load todos.',
            });
        }
    };

    /**
     * Handles saving a todo (create or update)
     */
    const saveTodo = async () => {
        const id = todoIdInput.value;
        const title = todoTitleInput.value.trim();

        if (!title) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Title cannot be empty.',
            });
            return;
        }

        const url = id ? `/${id}/` : '/';
        const method = id ? 'put' : 'post';

        try {
            await axios({ method, url, data: { title } });
            todoModal.hide();
            Swal.fire({
                icon: 'success',
                title: id ? 'Todo Updated!' : 'Todo Added!',
                showConfirmButton: false,
                timer: 1500
            });
            loadTodos();
        } catch (error) {
            console.error('Error saving todo:', error);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Could not save todo.',
            });
        }
    };

    // --- Event Listeners ---

    // Open modal for adding a new todo
    addTodoBtn.addEventListener('click', () => {
        todoForm.reset();
        todoIdInput.value = '';
        todoModalLabel.textContent = 'Add Todo';
        todoModal.show();
    });

    // Handle click events on the todo list (for complete, delete, edit)
    todoList.addEventListener('click', async (e) => {
        const target = e.target;
        const li = target.closest('.todo-item');
        if (!li) return;
        const id = li.dataset.id;

        // Handle delete
        if (target.classList.contains('delete-btn')) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete it!'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        await axios.delete(`/${id}/`);
                        // Fade-out animation
                        li.style.transition = 'opacity 0.3s ease';
                        li.style.opacity = '0';
                        setTimeout(() => li.remove(), 300);

                        Swal.fire(
                            'Deleted!',
                            'Your todo has been deleted.',
                            'success'
                        );
                    } catch (error) {
                        console.error('Error deleting todo:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: 'Could not delete todo.',
                        });
                    }
                }
            });
        }

        // Handle toggle complete
        if (target.classList.contains('complete-checkbox')) {
            const completed = target.checked;
            try {
                await axios.put(`/${id}/`, { completed });
                li.classList.toggle('completed', completed);
            } catch (error) {
                console.error('Error updating todo status:', error);
                // Revert checkbox on error
                target.checked = !completed;
            }
        }

        // Handle edit (clicking the title)
        if (target.classList.contains('todo-title')) {
            todoIdInput.value = id;
            todoTitleInput.value = target.textContent;
            todoModalLabel.textContent = 'Edit Todo';
            todoModal.show();
        }
    });

    // Save button in modal
    saveTodoBtn.addEventListener('click', saveTodo);

    // Also save on enter key in the input
    todoTitleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveTodo();
        }
    });


    // --- Initial Load ---
    loadTodos();
});
