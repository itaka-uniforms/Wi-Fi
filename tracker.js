const DB_URL = "https://jotmnppqkzlvecrzcasp.supabase.co";
const DB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdG1ucHBxa3psdmVjcnpjYXNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzIyODMsImV4cCI6MjA5MzY0ODI4M30.LZEpOj1mdE8tn9rIsgUlJde2LIal8XsjDA-t62d5I2k";

// =========================================
// OBIEKT 1: LOGOWANIE DO BAZY (SUPABASE)
// =========================================
const Tracker = {
    // Funkcja pomocnicza do wyciągania informacji o karcie graficznej
    getWebGL() {
        try {
            const canvas = document.createElement("canvas");
            const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            if (!gl) return "no-webgl";
            const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
            return debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "unmasked-no-gl";
        } catch (e) {
            return "gl-error";
        }
    },

    // 1. Główna funkcja generująca unikalny odcisk palca (Fingerprint)
    async generateFingerprint() {
        try {
            // Renderowanie Canvas (unikalność procesora graficznego i czcionek)
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            ctx.textBaseline = "top";
            ctx.font = "14px Arial";
            ctx.fillText("wifi_test_security_2026", 2, 2);
            const canvasData = canvas.toDataURL();

            // Zbieranie maksymalnej liczby unikalnych cech urządzenia w celu blokowania spamu
            const data = [
                navigator.userAgent,                     // Przeglądarka i system
                navigator.language,                      // Główny język
                navigator.languages?.join(","),          // Lista preferowanych języków
                screen.width + "x" + screen.height,      // Rozdzielczość ekranu
                screen.availWidth + "x" + screen.availHeight, // Dostępna przestrzeń (bez pasków)
                screen.colorDepth,                       // Głębia kolorów
                window.devicePixelRatio,                 // Zagęszczenie pikseli
                Intl.DateTimeFormat().resolvedOptions().timeZone, // Strefa czasowa
                navigator.hardwareConcurrency || "unknown", // Liczba rdzeni procesora
                navigator.deviceMemory || "unknown",     // RAM (w przybliżeniu)
                navigator.platform,                      // Platforma systemowa
                navigator.vendor,                        // Producent przeglądarki
                navigator.maxTouchPoints || 0,           // Czy ekran jest dotykowy
                canvasData,                              // Unikalny obrazek z Canvas
                this.getWebGL()                          // Model karty graficznej
            ].join("||");

            // Haszowanie danych algorytmem SHA-256
            const encoder = new TextEncoder();
            const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            
            // Konwersja na czytelny ciąg HEX
            return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        } catch (e) {
            console.error("Fingerprint Error:", e);
            // Fallback: Jeśli wszystko zawiedzie, generujemy losowe ID, 
            // ale dodajemy stały prefix, żeby wiedzieć, że to błąd
            return "legacy_" + Math.random().toString(36).substring(2, 15);
        }
    },

    // 2. Funkcja wysyłająca dane (Poprawna wersja z device_id)
    async sendEvent(eventName, domain = "anonymous") {
        if (localStorage.getItem('p_status') === 'done') {
                console.log("Użytkownik już zweryfikowany, blokuję nadpisanie.");
                return;
            }
        const deviceID = await this.generateFingerprint();
        let currentStatus = "email_only";
            if (eventName.includes("SUCCESS")) {
                currentStatus = "completed";
            }
        try {
        const response = await fetch(`${DB_URL}/rest/v1/phishing_stats?on_conflict=device_id`, {                method: 'POST',
                headers: {
                    'apikey': DB_KEY,
                    'Authorization': `Bearer ${DB_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                body: JSON.stringify({
                    event_name: eventName,
                    user_domain: domain,
                    device_id: deviceID, // Kluczowe pole!
                    status: currentStatus,
                    created_at: new Date()
                })
            });

            if (response.ok) {
                console.log(`🚀 Baza: Zapisano | Status: ${currentStatus} | ${eventName} (ID: ${deviceID.substring(0, 8)}...)`);
            } else {
                console.warn("⚠️ Baza odrzuciła wpis (prawdopodobnie duplikat).");
            }
        } catch (err) {
            console.error("❌ Błąd połączenia z Supabase:", err);
        }
    },

    // 3. Funkcja pobierająca liczbę ofiar
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
            const countHeader = response.headers.get('content-range');
            return countHeader ? countHeader.split('/')[1] : "0"; 
        } catch (err) {
            console.error("Błąd licznika:", err);
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
        console.log('System analizy zainicjalizowany.');
    },

    recordEmailEntered() {
        console.log("E-mail został wpisany.");
        this.save();
    },

    attachListeners() {
        document.addEventListener('copy', () => { this.stats.copiedUrl = true; this.save(); });
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

window.Tracker = Tracker;
window.UserStats = UserStats;
UserStats.init();