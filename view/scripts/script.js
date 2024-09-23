const tasksEndpoint = "http://localhost:8080/task/user";

// Loading
function hideLoader() {
    document.getElementById("loading").style.display = "none";
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
        const response = await fetch(tasksEndpoint, {
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

document.addEventListener("DOMContentLoaded", function (event) {
    if (!localStorage.getItem("Authorization"))
        window.location = "/view/login.html";
});

getTasks();