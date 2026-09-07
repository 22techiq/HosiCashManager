```javascript
/*
========================================================
MASC CLINIC API CLIENT
========================================================
*/

const API_URL =
    "https://script.google.com/macros/s/AKfycbzm9KC3IRhMwO8DmkGqeSubTy52PoBJ6FAHJYMKY6Yy1laWtKSCnl9PCruX6-Votkua/exec";


function getToken() {

    return localStorage.getItem("mascToken");

}


function getStoredUser() {

    try {

        return JSON.parse(
            localStorage.getItem("mascUser")
        );

    } catch {

        return null;

    }

}


/*
========================================================
API REQUEST
========================================================
*/

async function apiRequest(data = {}) {

    const request = {
        ...data
    };


    /*
     * Automatically attach session token
     * to protected requests.
     */

    if (data.action !== "login") {

        request.token = getToken();

    }


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type":
                    "text/plain;charset=utf-8"
            },

            body: JSON.stringify(request)

        });


        const result =
            await response.json();


        /*
         * Server says session expired.
         */

        if (
            result.authenticated === false
        ) {

            handleSessionExpired();

            return result;

        }


        return result;

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to connect to the server.",
            "error"
        );

        return {

            success: false,

            message:
                "Network error."

        };

    }

}


/*
========================================================
SESSION EXPIRED
========================================================
*/

function handleSessionExpired() {

    localStorage.removeItem("mascToken");
    localStorage.removeItem("mascUser");

    showToast(
        "Your session has expired. Please login again.",
        "error"
    );


    setTimeout(() => {

        window.location.href =
            "index.html";

    }, 1200);

}


/*
========================================================
LOGOUT
========================================================
*/

async function performLogout() {

    const token =
        getToken();


    if (token) {

        await apiRequest({

            action: "logout",

            token: token

        });

    }


    localStorage.removeItem("mascToken");
    localStorage.removeItem("mascUser");


    window.location.href =
        "index.html";

}


/*
========================================================
TOAST
========================================================
*/

function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById("toast");


    if (!toast) return;


    const icon =
        document.getElementById("toastIcon");


    const messageElement =
        document.getElementById("toastMessage");


    messageElement.textContent =
        message;


    icon.className =
        type === "success"

            ? "fa-solid fa-circle-check"

            : "fa-solid fa-circle-exclamation";


    toast.className =
        "toast " + type + " show";


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3500);

}
```
