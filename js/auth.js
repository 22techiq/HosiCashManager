```javascript
/*
========================================================
MASC CLINIC AUTHENTICATION
========================================================
*/


/*
 * If an active token already exists,
 * don't show login unnecessarily.
 */

if (
    localStorage.getItem("mascToken")
) {

    window.location.href =
        "dashboard.html";

}


const loginForm =
    document.getElementById("loginForm");


const password =
    document.getElementById("password");


const togglePassword =
    document.getElementById("togglePassword");


/*
========================================================
PASSWORD VISIBILITY
========================================================
*/

togglePassword.addEventListener(
    "click",
    () => {

        const icon =
            togglePassword.querySelector("i");


        if (
            password.type === "password"
        ) {

            password.type =
                "text";

            icon.className =
                "fa-solid fa-eye-slash";

        } else {

            password.type =
                "password";

            icon.className =
                "fa-solid fa-eye";

        }

    }
);


/*
========================================================
LOGIN
========================================================
*/

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const username =
            document
                .getElementById("username")
                .value
                .trim();


        const passwordValue =
            password.value;


        if (
            !username ||
            !passwordValue
        ) {

            showLoginMessage(
                "Enter your username and password.",
                "error"
            );

            return;

        }


        const button =
            document.getElementById(
                "loginButton"
            );


        const buttonText =
            document.getElementById(
                "loginButtonText"
            );


        const loader =
            document.getElementById(
                "loginLoader"
            );


        button.disabled = true;

        buttonText.textContent =
            "Signing in...";

        loader.classList.remove(
            "hidden"
        );


        try {

            const result =
                await apiRequest({

                    action: "login",

                    username: username,

                    password: passwordValue

                });


            if (
                result.success &&
                result.token
            ) {

                /*
                 * Store ONLY the session token
                 * and non-sensitive display data.
                 */

                localStorage.setItem(
                    "mascToken",
                    result.token
                );


                localStorage.setItem(
                    "mascUser",
                    JSON.stringify(
                        result.user
                    )
                );


                showLoginMessage(
                    "Login successful. Opening dashboard...",
                    "success"
                );


                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 500);


            } else {

                showLoginMessage(
                    result.message ||
                    "Invalid username or password.",
                    "error"
                );


                button.disabled =
                    false;

                buttonText.textContent =
                    "Sign in";

                loader.classList.add(
                    "hidden"
                );

            }

        } catch (error) {

            showLoginMessage(
                "Unable to connect to the server.",
                "error"
            );


            button.disabled =
                false;

            buttonText.textContent =
                "Sign in";

            loader.classList.add(
                "hidden"
            );

        }

    }
);


/*
========================================================
LOGIN MESSAGE
========================================================
*/

function showLoginMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "loginMessage"
        );


    element.textContent =
        message;


    element.className =
        "login-message " + type;

}
```
