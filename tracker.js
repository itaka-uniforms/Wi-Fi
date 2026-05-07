const DB_URL = "https://jotmnppqkzlvecrzcasp.supabase.co";
const DB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdG1ucHBxa3psdmVjcnpjYXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzIyODMsImV4cCI6MjA5MzY0ODI4M30.LZEpOj1mdE8tn9rIsgUlJde2LIal8XsjDA-t62d5I2k";

// =========================================
// OBIEKT 1: LOGOWANIE DO BAZY (SUPABASE)
// =========================================
const Tracker = {
    // 1. Funkcja wysyłająca dane do bazy
    async sendEvent(eventName, domain = "anonymous") {
        try {
            await fetch(`${DB_URL}/rest/v1/phishing_stats`, {
                method: 'POST',
                headers: {
                    'apikey': DB_KEY,
                    'Authorization': `Bearer ${DB_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    event_name: eventName,
                    user_domain: domain,
                    created_at: new Date()
                })
            });
            console.log(`🚀 Baza danych: ${eventName} zapisane.`);
        } catch (err) {
            console.error("❌ Błąd bazy danych:", err);
        }
    },

    // 2. Funkcja pobierająca liczbę ofiar
    async getVictimsCount() {
        try {
            const response = await fetch(`${DB_URL}/rest/v1/phishing_stats?event_name=eq.2_password_entered_SUCCESS`, {
                
                method: 'GET',
                headers: {
                    'apikey': DB_KEY,
                    'Authorization': `Bearer ${DB_KEY}`,
                    'Prefer': 'count=exact'
                }
            });
            console.log(await response.text());
            const countHeader = response.headers.get('content-range');
            if (countHeader) {
                return countHeader.split('/')[1]; 
            }
            return "Wiele"; 
        } catch (err) {
            console.error("Błąd pobierania licznika:", err);
            return "Ponad 1000";
        }
    }
};
// =========================================
// OBIEKT 2: ANALIZA ZACHOWANIA (LOKALNA)
// =========================================
const UserStats = {
    stats: {
        startTime: null,
        totalTime: 0,
        checkedUrl: false,
        hoveredOverUrl: false,
        copiedUrl: false,
        showedPasswordClicked: false,
        isComplete: false
    },

    init() {
        this.load();
        if (!this.stats.startTime) {
            this.stats.startTime = Date.now();
            this.save();
        }
        this.attachListeners();
        console.log('📊 System analizy zainicjalizowany.');
    },
recordEmailEntered() {
        console.log("📧 E-mail został wpisany.");
        this.save(); // Zapisuje stan, żeby wiedzieć na kolejnej stronie, że user zaczął proces
    },
    attachListeners() {
        document.addEventListener('copy', () => { this.stats.copiedUrl = true; this.save(); });
        // Hover na podejrzane elementy
        document.querySelectorAll('.logo, .subtitle, .footer-links a').forEach(el => {
            el.addEventListener('mouseenter', () => { this.stats.hoveredOverUrl = true; this.save(); });
        });
    },

    recordPasswordShow() {
        this.stats.showedPasswordClicked = true;
        this.save();
        console.log('👁️ Statystyka: Hasło odkryte.');
    },

    recordPasswordEntered() {
        this.stats.totalTime = Math.round((Date.now() - this.stats.startTime) / 1000);
        this.stats.isComplete = true;
        this.save();
    },

    save() { sessionStorage.setItem('google_phish_stats', JSON.stringify(this.stats)); },
    load() {
        const data = sessionStorage.getItem('google_phish_stats');
        if (data) this.stats = JSON.parse(data);
    },
    
    getFinalReport() {
        this.load();
        let risk = { text: 'NISKIE', color: '#34a853' };
        if (this.stats.totalTime < 30) risk = { text: 'WYSOKIE', color: '#d93025' };
        else if (this.stats.totalTime < 50) risk = { text: 'ŚREDNIE', color: '#fabb05' };
        
        return { ...this.stats, risk };
    }
};

// =========================================
// UDOSTĘPNIENIE GLOBALNE I START
// =========================================
window.Tracker = Tracker;
window.UserStats = UserStats;

// Startujemy analizę od razu po załadowaniu pliku
UserStats.init();