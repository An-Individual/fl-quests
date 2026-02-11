import { Logger } from "./logger.js";
import { QuestsSourceType } from "./quests/quests-datatypes.js";

export class SettingsManager {
    static singleInstance;
    static instance() {
        if(this.singleInstance){
            return this.singleInstance;
        }
        this.singleInstance = new SettingsManager();
        return this.singleInstance;
    }
    
    static SettingKeys = [
        "HideNotStarted",
        "QuestsSourceType",
        "CustomQuestsSource",
        "EnableImportedQuests",
        "ImportedQuests"
    ];

    getDefaultSettings() {
        return {
            HideNotStarted: false,
            QuestsSourceType: QuestsSourceType.Local
        };
    }

    constructor() {
        this.restoreSettings();
        this.initializeGettersAndSetters();
    }

    initializeGettersAndSetters() {
        SettingsManager.SettingKeys.forEach(key => {
            this[`get${key}`] = function() {
                return this.get(key);
            }

            this[`set${key}`] = function(value) {
                this.set(key, value);
            }
        })
    }

    storeSettings() {
        if(this.settings){
            localStorage.setItem("flq-settings", JSON.stringify(this.settings));
        }
    }

    restoreSettings() {
        let storedSettings = localStorage.getItem("flq-settings");
        let result;
        if(storedSettings){
            try {
                result = JSON.parse(storedSettings);
            } catch (error) {
                Logger.error(error);
                result = this.getDefaultSettings();
            }
        } else {
            result = this.getDefaultSettings();
        }

        this.applyDefaults(result);
        this.settings = result;
    }

    applyDefaults(settings) {
        const defaults = this.getDefaultSettings();
        for(const key in defaults) {
            if(!Object.hasOwn(settings, key)) {
                settings[key] = defaults[key];
            }
        }
    } 

    restoreDefaults() {
        this.settings = this.getDefaultSettings();
        this.storeSettings();
    }

    set(name, value) {
        this.settings[name] = value;
        this.storeSettings();
    }

    get(name){
        return this.settings[name];
    }

    getCategoryState(id) {
        return this.get("catstate:" + id);
    }

    setCategoryState(id, state) {
        this.set("catstate:" + id, state);
    }
}