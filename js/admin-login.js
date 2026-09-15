// ======================================
// HAUNTED FEST - ADMIN LOGIN
// ======================================


// ======================================
// PASSWORD SHOW / HIDE
// ======================================

const passwordInput = document.getElementById("adminPassword");
const togglePassword = document.getElementById("togglePassword");

if (passwordInput && togglePassword) {

    togglePassword.addEventListener("click", function () {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";
            togglePassword.textContent = "🙈";

        } else {

            passwordInput.type = "password";
            togglePassword.textContent = "👁️";

        }

    });

}


// ======================================
// ADMIN LOGIN
// ======================================

const loginForm = document.getElementById("adminLoginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("adminUsername").value.trim();

        const password =
            document.getElementById("adminPassword").value;


        if (!email || !password) {

            alert("Please enter your email and password.");

            return;
        }


        // ======================================
        // SHOW LOGIN MESSAGE
        // ======================================

        const loginButton =
            loginForm.querySelector("button[type='submit']");

        loginButton.textContent = "LOGGING IN...";
        loginButton.disabled = true;


        // ======================================
        // SUPABASE LOGIN
        // ======================================

        try {

            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email: email,
                    password: password
                });


            if (error) {

                console.error("Supabase login error:", error);

                alert("Login failed: " + error.message);

                loginButton.textContent = "🔐 LOGIN";
                loginButton.disabled = false;

                return;
            }


            // ======================================
            // LOGIN SUCCESS
            // ======================================

            console.log("Admin login successful:", data.user);

            window.location.href = "admin.html";

        } catch (error) {

            console.error("Unexpected login error:", error);

            alert("Something went wrong: " + error.message);

            loginButton.textContent = "🔐 LOGIN";
            loginButton.disabled = false;

        }

    });

}