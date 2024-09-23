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
                            <button type="button" class="btn btn-light btn-sm me-2" onclick="getTask(${task.id})">
                                Update <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-success btn-sm" onclick="deleteTask(${task.id})">
                                Done <i class="bi bi-check-circle"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
    }
    document.getElementById("tasks").innerHTML = postIts;
}

// Display Tasks
async function getTasks() {
    let key = "Authorization";
    try {
        const response = await fetch("http://localhost:8080/task/user", {
            method: "GET",
            headers: new Headers({
                Authorization: localStorage.getItem(key),
            }),
        });

        if (response.ok) {
            var data = await response.json();
            console.log("get tasks: " + data);
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
                getTasks();
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

// Reset modal
document.addEventListener('DOMContentLoaded', function() {
    var taskModal = document.getElementById('taskModal');
    taskModal.addEventListener('hidden.bs.modal', function () {
        document.getElementById('taskForm').reset();
    });
});

// Check Authorization
document.addEventListener("DOMContentLoaded", function (event) {
    if (!localStorage.getItem("Authorization"))
        window.location = "/view/login.html";
});

getTasks();