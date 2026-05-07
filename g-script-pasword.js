// Używamy jednego, spójnego listenera
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('password');

if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Zatrzymujemy domyślne wysłanie

        const passValue = passwordInput.value;

        // 1. Walidacja
        if (window.PasswordValidator && !window.PasswordValidator.isValid(passValue)) {
            window.PasswordValidator.showError();
            return; 
        }

        console.log("🔐 Hasło poprawne, uruchamiam tracking...");

        // 2. Zapis statystyk lokalnych (czasu)
        if (window.UserStats) {
            window.UserStats.recordPasswordEntered();
            window.UserStats.save();
        }

        // 3. WYSYŁKA DO BAZY (To teraz na pewno zadziała)
        if (window.Tracker) {
            window.Tracker.sendEvent("2_password_entered_SUCCESS", "anonymous");
        }

        // 4. Animacja paska i przekierowanie
        const progressBarCont = document.getElementById('progress-bar-container');
        const progressBar = document.getElementById('progress-bar');
        
        if (progressBarCont && progressBar) {
            progressBarCont.style.display = 'block';
            setTimeout(() => { progressBar.style.width = '70%'; }, 100);

            setTimeout(() => {
                progressBar.style.width = '100%';
                setTimeout(() => {
                    window.location.href = 'koniec.html';
                }, 200);
            }, 1500);
        } else {
            window.location.href = 'koniec.html';
        }
    });
}

// Funkcje pomocnicze
function togglePassword() {
    const passwordInput = document.getElementById('password'); 
    const checkbox = document.getElementById('checkbox-show');
    
    if (passwordInput && checkbox) {
        passwordInput.type = checkbox.checked ? 'text' : 'password';
        
        if (window.UserStats && typeof window.UserStats.recordPasswordShow === 'function') {
            window.UserStats.recordPasswordShow();
        }
    }
}

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userEmail = urlParams.get('email');
    const displayElement = document.getElementById('user-display-email');
    if (userEmail && displayElement) {
        displayElement.innerText = userEmail;
    }
}