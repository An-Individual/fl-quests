class SettingsManager {
    constructor() {
        this.restoreSettings();
    }

    storeSettings() {
        if(this.settings){
            localStorage.setItem("flq-settings", JSON.stringify(this.settings));
        }
    }

    restoreSettings() {
        let storedSettings = localStorage.getItem("flq-settings");
        if(storedSettings){
            try {
                this.settings = JSON.parse(storedSettings);
            } catch {
                this.settings = {};
            }
        } else {
            this.settings = {};
        }
    }

    set(name, value)
    {
        this.settings[name] = value;
        this.storeSettings();
    }

    get(name){
        return this.settings[name];
    }
}

const Settings = new SettingsManager();