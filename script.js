// Theme toggle
const modeToggle = document.getElementById("modeToggle");
const themeIcon = document.getElementById("theme-icon");
const body = document.body;

modeToggle.addEventListener("change", () => {
  body.classList.toggle("light");
  themeIcon.classList.toggle("bi-sun-fill");
  themeIcon.classList.toggle("bi-moon-fill");
  renderBoard();
});

// Load current board from localStorage
let currentBoard = localStorage.getItem("currentBoard") || "Platform Launch";

let boards = JSON.parse(localStorage.getItem("kanbanBoards")) || {
  "Platform Launch": {
    columns: {
      todo: { name: "Todo", tasks: [] },
      doing: { name: "Doing", tasks: [] },
      done: { name: "Done", tasks: [] },
    },
  },
};

const boardList = document.getElementById("boardList");
const currentBoardName = document.getElementById("currentBoardName");
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDesc = document.getElementById("taskDesc");
const taskStatus = document.getElementById("taskStatus");
const subtaskList = document.getElementById("subtaskList");
const kanbanBoard = document.getElementById("kanbanBoard");

const sidebar = document.getElementById("sidebar");
const hideSidebarBtn = document.getElementById("hideSidebarBtn");
const showSidebarBtn = document.getElementById("showSidebarBtn");

hideSidebarBtn.addEventListener("click", () => {
  sidebar.classList.add("d-none");
  body.classList.add("sidebar-hidden");
  showSidebarBtn.classList.remove("d-none");
});

showSidebarBtn.addEventListener("click", () => {
  sidebar.classList.remove("d-none");
  body.classList.remove("sidebar-hidden");
  showSidebarBtn.classList.add("d-none");
});

function addSubtaskInput() {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "form-control subtask-input mb-2";
  input.placeholder = `Subtask ${subtaskList.children.length + 1}`;
  subtaskList.appendChild(input);
}
window.addSubtaskInput = addSubtaskInput;

function saveBoards() {
  localStorage.setItem("kanbanBoards", JSON.stringify(boards));
  localStorage.setItem("currentBoard", currentBoard);
}

function renderBoard() {
  kanbanBoard.innerHTML = "";
  const board = boards[currentBoard];
  const columns = board.columns;

  taskStatus.innerHTML = "";
  currentBoardName.textContent = currentBoard;

  for (const key in columns) {
    const col = columns[key];
    const colDiv = document.createElement("div");
    colDiv.innerHTML = `
      <h5 class="column-title">${col.name}</h5>
      <div class="task-column" data-status="${key}"></div>
    `;
    const taskContainer = colDiv.querySelector(".task-column");

    col.tasks.forEach((task, index) => {
      const card = document.createElement("div");
      card.className = `task-card mb-3 p-3 rounded ${
        body.classList.contains("light")
          ? "text-dark bg-white"
          : "text-light bg-dark-subtle"
      }`;
      card.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <h6 class="fw-semibold mb-1">${task.title || "(Untitled Task)"}</h6>
            <small class="text-muted">${task.subtasks.length} Subtasks</small>
          </div>
          <div class="dropdown">
            <button class="btn btn-sm btn-transparent text-muted" data-bs-toggle="dropdown">
              <i class="bi bi-three-dots-vertical"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#" onclick="editTask('${key}', ${index})">Edit</a></li>
              <li><a class="dropdown-item text-danger" href="#" onclick="deleteTask('${key}', ${index})">Delete</a></li>
            </ul>
          </div>
        </div>
      `;
      taskContainer.appendChild(card);
    });

    kanbanBoard.appendChild(colDiv);

    const option = document.createElement("option");
    option.value = key;
    option.textContent = col.name;
    taskStatus.appendChild(option);
  }

  // + New Column button (with auto key from name)
  const addCol = document.createElement("div");
  addCol.className =
    "add-column-placeholder d-flex align-items-center justify-content-center";
  addCol.style.height = "100%";
  addCol.innerHTML = '<span class="text-muted">+ New Column</span>';
  addCol.onclick = () => {
    const newName = prompt("Enter new column name:");
    if (!newName) return;
    const newKey = newName.trim().toLowerCase().replace(/\s+/g, "-");
    if (boards[currentBoard].columns[newKey]) {
      alert("A column with this name already exists.");
      return;
    }
    boards[currentBoard].columns[newKey] = { name: newName.trim(), tasks: [] };
    saveBoards();
    renderBoard();
  };
  kanbanBoard.appendChild(addCol);
}

function deleteTask(status, index) {
  if (confirm("Delete this task?")) {
    boards[currentBoard].columns[status].tasks.splice(index, 1);
    saveBoards();
    renderBoard();
  }
}

function editTask(status, index) {
  const task = boards[currentBoard].columns[status].tasks[index];
  taskTitle.value = task.title;
  taskDesc.value = task.description;
  taskStatus.value = status;
  subtaskList.innerHTML = "";

  task.subtasks.forEach((subtask, i) => {
    const input = document.createElement("input");
    input.type = "text";
    input.className = "form-control subtask-input mb-2";
    input.placeholder = `Subtask ${i + 1}`;
    input.value = subtask;
    subtaskList.appendChild(input);
  });

  const modal = new bootstrap.Modal(document.getElementById("addTaskModal"));
  modal.show();

  taskForm.onsubmit = function (e) {
    e.preventDefault();

    const updatedTask = {
      title: taskTitle.value.trim(),
      description: taskDesc.value.trim(),
      status: taskStatus.value,
      subtasks: Array.from(subtaskList.querySelectorAll("input"))
        .map((el) => el.value.trim())
        .filter((txt) => txt !== ""),
    };

    boards[currentBoard].columns[status].tasks.splice(index, 1);
    boards[currentBoard].columns[updatedTask.status].tasks.push(updatedTask);
    saveBoards();
    renderBoard();
    modal.hide();
    taskForm.reset();
    subtaskList.innerHTML = `
      <input type="text" class="form-control subtask-input mb-2" placeholder="Subtask 1" />
      <input type="text" class="form-control subtask-input mb-2" placeholder="Subtask 2" />
    `;
    taskForm.onsubmit = defaultFormSubmitHandler;
  };
}

function defaultFormSubmitHandler(e) {
  e.preventDefault();
  const title = taskTitle.value.trim();
  const description = taskDesc.value.trim();
  const status = taskStatus.value;
  const subtasks = Array.from(subtaskList.querySelectorAll("input"))
    .map((el) => el.value.trim())
    .filter((txt) => txt !== "");

  if (!title || !status) {
    alert("Task title and status are required.");
    return;
  }

  const task = { title, description, status, subtasks };
  boards[currentBoard].columns[status].tasks.push(task);
  saveBoards();
  renderBoard();

  taskForm.reset();
  subtaskList.innerHTML = `
    <input type="text" class="form-control subtask-input mb-2" placeholder="Subtask 1" />
    <input type="text" class="form-control subtask-input mb-2" placeholder="Subtask 2" />
  `;

  const modal = bootstrap.Modal.getInstance(
    document.getElementById("addTaskModal")
  );
  if (modal) modal.hide();
}

function renderBoardList() {
  boardList.innerHTML = "";
  Object.keys(boards).forEach((boardName) => {
    const li = document.createElement("li");
    li.className = "sidebar-item";
    li.dataset.board = boardName;
    li.textContent = boardName;
    if (boardName === currentBoard) li.classList.add("active");

    li.onclick = () => {
      document
        .querySelectorAll(".sidebar-item")
        .forEach((el) => el.classList.remove("active"));
      li.classList.add("active");
      currentBoard = boardName;
      saveBoards();
      currentBoardName.textContent = boardName;
      renderBoard();
    };

    boardList.appendChild(li);
  });
}

document.getElementById("createBoardBtn").addEventListener("click", () => {
  const newBoard = prompt("Enter new board name:");
  if (!newBoard || boards[newBoard]) return;
  boards[newBoard] = {
    columns: {
      todo: { name: "Todo", tasks: [] },
      doing: { name: "Doing", tasks: [] },
      done: { name: "Done", tasks: [] },
    },
  };
  currentBoard = newBoard;
  saveBoards();
  renderBoardList();
  renderBoard();
});

document.getElementById("editBoardBtn")?.addEventListener("click", () => {
  const newName = prompt("Enter new board name:", currentBoard);
  if (!newName || newName === currentBoard || boards[newName]) return;
  boards[newName] = boards[currentBoard];
  delete boards[currentBoard];
  currentBoard = newName;
  saveBoards();
  renderBoardList();
  renderBoard();
});

document.getElementById("deleteBoardBtn")?.addEventListener("click", () => {
  if (confirm(`Delete board "${currentBoard}"?`)) {
    delete boards[currentBoard];
    currentBoard = Object.keys(boards)[0] || "Untitled Board";
    if (!boards[currentBoard]) {
      boards[currentBoard] = {
        columns: {
          todo: { name: "Todo", tasks: [] },
          doing: { name: "Doing", tasks: [] },
          done: { name: "Done", tasks: [] },
        },
      };
    }
    saveBoards();
    renderBoardList();
    renderBoard();
  }
});

function init() {
  renderBoardList();
  renderBoard();
  taskForm.onsubmit = defaultFormSubmitHandler;
}

init();
