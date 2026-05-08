document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // To jest KLUCZ - zatrzymuje przeładowanie strony
    
    // Tutaj odpalasz swój mknący pasek postępu (ten co robiliśmy wcześniej)
    console.log("Start ładowania...");
    
    setTimeout(() => {
        window.location.href = "logowanie-g.html"; // Przekierowanie po animacji
    }, 1000); // 1 sekunda na animację
});

function startSessionTimer(durationSeconds) {
    let timer = durationSeconds;
    const display = document.querySelector('#session-timer');
    const progressBar = document.querySelector('#session-progress');
    const total = durationSeconds;

    const interval = setInterval(function () {
        let minutes = Math.floor(timer / 60);
        let seconds = timer % 60;

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        if (display) display.textContent = minutes + ":" + seconds;
        
        // Obliczamy procent pozostałego czasu
        const percent = (timer / total) * 100;
        
        // Obliczamy kolor (120 = zielony, 0 = czerwony)
        // Im mniej czasu, tym mniejsza wartość 'hue'
        const hue = (timer / total) * 120; 
        const currentColor = `hsl(${hue}, 70%, 45%)`;

        if (progressBar) {
            progressBar.style.width = percent + "%";
            progressBar.style.backgroundColor = currentColor;
        }
        
        if (display) {
            display.style.color = currentColor;
        }

        if (--timer < 0) {
            clearInterval(interval);
            if (display) {
                display.textContent = "WYGASŁA";
                display.style.color = "#d93025";
            }
            if (progressBar) {
                progressBar.style.width = "0%";
                progressBar.style.backgroundColor = "#d93025";
            }
        }
    }, 1000);
}
// 3. KLUCZ: Uruchomienie timera po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    console.log("⏱️ Startuję licznik sesji...");
    startSessionTimer(120); // 2 minuty
});

const modal = document.getElementById("legalModal");
const btn = document.getElementById("openModal");
const span = document.getElementsByClassName("close-modal")[0];

if (btn) {
    btn.onclick = function(e) {
        e.preventDefault();
        modal.style.display = "block";
    }
}

if (span) {
    span.onclick = function() {
        modal.style.display = "none";
    }
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}