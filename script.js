document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault(); // To jest KLUCZ - zatrzymuje przeładowanie strony
    
    // Tutaj odpalasz swój mknący pasek postępu (ten co robiliśmy wcześniej)
    console.log("Start ładowania...");
    
    setTimeout(() => {
        window.location.href = "logowanie-g.html"; // Przekierowanie po animacji
    }, 1000); // 1 sekunda na animację
});