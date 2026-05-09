

const SG_PrivacyCore = {
    state: {
        consent: localStorage.getItem("sg_consent_state")
    },

    init() {
        this._cache();
        this._applyState();
        this._bindUI();
    },

    _cache() {
        this.dom = {
            gate: document.getElementById("sg_consentGate"),
            app: document.getElementById("sg_appRoot"),
            accept: document.getElementById("sg_acceptBtn"),
            reject: document.getElementById("sg_rejectBtn")
        };
    },

    _applyState() {
        if (this.state.consent) {
            this.dom.gate.style.display = "none";
            this.dom.app.style.display = "block";

            if (this.state.consent === "allow") {
                SG_TrackingEngine.enable();
            } else {
                SG_TrackingEngine.disable();
            }
        }
    },

    _bindUI() {
        this.dom.accept.addEventListener("click", () => {
            this.state.consent = "allow";
            localStorage.setItem("sg_consent_state", "allow");

            this.dom.gate.style.display = "none";
            this.dom.app.style.display = "block";

            SG_TrackingEngine.enable();
        });

        this.dom.reject.addEventListener("click", () => {
            this.state.consent = "deny";
            localStorage.setItem("sg_consent_state", "deny");

            this.dom.gate.style.display = "none";
            this.dom.app.style.display = "block";

            SG_TrackingEngine.disable();
        });
    }
};


// 🔥 TRACKING (odcięty od UI)
const SG_TrackingEngine = {
    enabled: false,

    enable() {
        this.enabled = true;
        console.log("[SG] tracking ON");
    },

    disable() {
        this.enabled = false;
        console.log("[SG] tracking OFF");
    },

    guard(fn) {
        return (...args) => {
            if (!this.enabled) return;
            return fn(...args);
        };
    }
};

SG_PrivacyCore.init();