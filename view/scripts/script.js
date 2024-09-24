let userId = null;

// Loading
function hideLoader() {
    document.getElementById("loading").style.display = "none";
}

// Display Toast
function showToast(id, message) {
    const toastElement = document.querySelector(id);
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = message;

    toastElement.style.zIndex = "1056";
    toastElement.style.position = "fixed";

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}

// Display Tasks
function show(tasks) {
    let postIts = '';
    for (let task of tasks) {
        postIts += `
            <div class="col">
                <div class="card h-100 bg-custom-gradi">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-dark">Task ${task.id}</h5>
                        <p class="card-text flex-grow-1">${task.description}</p>
                        <div class="mt-auto">
                            <button type="button" class="btn btn-light btn-sm  text-primary me-1" onclick="getTask(${task.id})">
                                Update <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-light btn-sm text-danger me-1" onclick="deleteTask(${task.id})">
                                Delete <i class="bi bi-trash"></i>
                            </button>
                            <button type="button" class="btn btn-light btn-sm text-success me-1" onclick="doneTask(${task.id})">
                                Done <i class="bi bi-check-circle"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    document.getElementById("tasks").innerHTML = postIts;
}


// Display UnDone Tasks
async function getUnDoneTasks() {
    let key = "Authorization";
    try {
        const response = await fetch("http://localhost:8080/task/undone", {
            method: "GET",
            headers: new Headers({
                Authorization: localStorage.getItem(key),
            }),
        });

        if (response.ok) {
            var data = await response.json();
            console.log("get undone tasks: " + data);
            if (response) hideLoader();
            show(data);
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.message || "Failed to fetch tasks.";
            showToast("#errorToast", errorMessage);
        }
    } catch (error) {
        console.error("Error:", error);
        showToast("#errorToast", "An unexpected error occurred while fetching tasks.");
    }
}

// Post New Task
async function postTask() {
    let description = document.getElementById("taskDescription").value;

    console.log(description);

    if (description) {
        let key = "Authorization";
        try {
            const response = await fetch("http://localhost:8080/task", {
                method: "POST",
                headers: new Headers({
                    "Content-Type": "application/json; charset=utf8",
                    Accept: "application/json",
                    Authorization: localStorage.getItem(key),
                }),
                body: JSON.stringify({
                    description: description,
                }),
            });
            
            if (response.ok) {
                showToast("#okToast", "Task created successfully.");
                getUnDoneTasks();
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || "Failed to create task.";
                showToast("#errorToast", errorMessage);
            }
        } catch (error) {
            console.error("Error:", error);
            showToast("#errorToast", "An unexpected error occurred while creating the task.");
        }
    } else {
        showToast("#errorToast", "Please fill in the task description.");
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
    modal.hide();
}

// Get Task By Id
async function getTask(taskId) {
    console.log(taskId);
    let key = "Authorization";
    try {
        const response = await fetch(`http://localhost:8080/task/${taskId}`, {
            method: "GET",
            headers: new Headers({
                Authorization: localStorage.getItem(key),
            }),
        });

        if (response.ok) {
            const task = await response.json();
            const desc = task.description;
            console.log("Description fetched: " + desc);

            document.getElementById("taskDescriptionUpdate").value = desc;

            document.getElementById("taskModalUpdate").setAttribute('data-task-id', taskId);

            const modal = new bootstrap.Modal(document.getElementById('taskModalUpdate'));
            modal.show();
        } else {
            showToast("#errorToast", "Failed to get the task.");
        }
    } catch (error) {
        console.error("Error:", error);
        showToast("#errorToast", "An unexpected error occurred while getting the task.");
    }
}

// Update Task
async function updateTask() {
    const taskId = document.getElementById("taskModalUpdate").getAttribute('data-task-id');
    const description = document.getElementById("taskDescriptionUpdate").value;
 
    console.log("Updating task id " + taskId + " with description: " + description);
 
    if (description) {
         let key = "Authorization";
        try {
            const response = await fetch(`http://localhost:8080/task/${taskId}`, {
                method: "PUT",
                headers: new Headers({
                    "Content-Type": "application/json; charset=utf8",
                    Accept: "application/json",
                    Authorization: localStorage.getItem(key),
                }),
                body: JSON.stringify({
                    description: description,
                }),
            });
 
            if (response.ok) {
                showToast("#okToast", "Task updated successfully.");
                getUnDoneTasks();
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || "Failed to update task.";
                showToast("#errorToast", errorMessage);
            }
        } catch (error) {
            console.error("Error:", error);
            showToast("#errorToast", "An unexpected error occurred while updating the task.");
        }
    } else {
        showToast("#errorToast", "Please fill in the task description.");
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById('taskModalUpdate'));
    modal.hide();
 }

// Delete Task
async function deleteTask(taskId) {
    console.log(taskId);
    let key = "Authorization";
    try {
        const response = await fetch(`http://localhost:8080/task/${taskId}`, {
            method: "DELETE",
            headers: new Headers({
                Authorization: localStorage.getItem(key),
            }),
        });

        if (response.ok) {
            showToast("#okToast", "Task deleted successfully.");
            getUnDoneTasks();
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.message || "Failed to delete task.";
            showToast("#errorToast", errorMessage);
        }
    } catch (error) {
        console.error("Error:", error);
        showToast("#errorToast", "An unexpected error occurred while deleting task.");
    }
}

// Done Task
async function doneTask(taskId) {
    console.log(taskId);
    let key = "Authorization";
    try {
        const response = await fetch(`http://localhost:8080/task/done/${taskId}`, {
            method: "PUT",
            headers: new Headers({
                Authorization: localStorage.getItem(key),
            }),
        });

        if (response.ok) {
            showToast("#okToast", "Task done successfully.");
            getUnDoneTasks();
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.message || "Failed to done task.";
            showToast("#errorToast", errorMessage);
        }
    } catch (error) {
        console.error("Error:", error);
        showToast("#errorToast", "An unexpected error occurred while done task.");
    }
}

// Show Profile Info
function showProfileInfo() {
    var profileSection = document.getElementById("profileSection");
    profileSection.classList.remove("d-none");
    getUserInfo();
}

// Hide Profile Info
function hideProfileInfo() {
    var profileSection = document.getElementById("profileSection");
    profileSection.classList.add("d-none");
}

// Get User Logged Info
async function getUserInfo() {
    let key = "Authorization";
    try {
        const response = await fetch("http://localhost:8080/user/info", {
            method: "GET",
            headers: new Headers({
                Authorization: localStorage.getItem(key),
            }),
        });

        if (response.ok) {
            var data = await response.json();
            console.log(data);
            const name = data.username;
            document.getElementById("title").innerHTML = `Welcome, ${name.charAt(0).toUpperCase() + name.slice(1)}! <br> Check Your Tasks`;
            document.getElementById("username").innerHTML = name.charAt(0).toUpperCase() + name.slice(1);
            document.getElementById("profile").innerHTML = `Profile: ${data.profiles}`;
            document.getElementById("tasksLeft").innerHTML = data.tasksLeft;
            document.getElementById("tasksDone").innerHTML = data.tasksDone;
            document.getElementById("tasksTotal").innerHTML = data.tasksTotal;
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.message || "Failed to fetch user info.";
            showToast("#errorToast", errorMessage);
        }
    } catch (error) {
        console.error("Error:", error);
        showToast("#errorToast", "An unexpected error occurred while fetching user info.");
    }
}

// Reset modal
document.addEventListener('DOMContentLoaded', function() {
    var modals = document.querySelectorAll('.modal');
    modals.forEach(function(modal) {
        modal.addEventListener('hidden.bs.modal', function () {
            var form = this.querySelector('form');
            if (form) {
                form.reset();
            }
        });
    });
});

// Check Authorization
document.addEventListener("DOMContentLoaded", function (event) {
    if (!localStorage.getItem("Authorization"))
        window.location = "/view/login.html";
});

getUnDoneTasks();
getUserInfo()