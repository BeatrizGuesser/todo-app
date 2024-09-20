async function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    
    console.log(username, password);
    
    try {

        const response = await fetch("http://localhost:8080/login", {
            method: "POST",
            headers: new Headers({
                "Content-Type": "application/json; charset=utf8",
                Accept: "application/json",
            }),
            body: JSON.stringify({
                username: username,
                password: password,
            }),
        });

        let key = "Authorization";
        let token = response.headers.get(key);
        window.localStorage.setItem(key, token);

        if (response.ok) {
            showToast("#okToast", "Login successful. Redirecting...");
            window.setTimeout(function () {
                window.location = "/view/index.html";
            }, 2000);
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.message || "Error when logging in.";
            showToast("#errorToast", errorMessage);
        }

    } catch (error) {
        console.error("Error:", error);
        showToast("#errorToast", "An unexpected error occurred.");
    }
}

function showToast(id, message) {
    const toastElement = document.querySelector(id);
    const toastBody = toastElement.querySelector('.toast-body');
    toastBody.textContent = message;

    toastElement.style.zIndex = "1056";
    toastElement.style.position = "fixed";

    const toast = new bootstrap.Toast(toastElement);
    toast.show();
}