class SettingsManager {
    static singleInstance;
    static instance() {
        if(this.singleInstance){
            return this.singleInstance;
        }
        this.singleInstance = new SettingsManager();
        return this.singleInstance;
    }
    
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

    set(name, value) {
        this.settings[name] = value;
        this.storeSettings();
    }

    get(name){
        return this.settings[name];
    }

    getQuestsSource() {
        return chrome.runtime.getURL('quests/quests.json')
    }
}