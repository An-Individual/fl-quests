import { SettingsManager } from "../settings.js";
import { QuestsValidator } from "./quests-validator.js";
import { Logger } from "../logger.js";
import { QuestsSourceType, LogicTypes, ComparisonTypes } from "./quests-datatypes.js";

export class QuestsManager {

    constructor() {
        this.refetchGracePeriod = Temporal.Duration.from({ hours: 12}).total("milliseconds");
        this.settings = SettingsManager.instance();
        this.validator = new QuestsValidator();
        this.getQuests();
    }

    clear() {
        this.quests = null;
        this.questsRaw = null;
    }

    clearImported() {
        this.quests = null;
    }

    async getQuests() {
        if(this.quests) {
            return this.quests
        }

        while(this.fetching) {
            await new Promise(r => setTimeout(r, 10));
            if(this.quests) {
                return this.quests;
            }
        }

        try {
            this.fetching = true;

            let sourceQuests = await this.fetchQuestsFromSource();

            if(!sourceQuests) {
                sourceQuests = {
                    version: "No Source Quests",
                    categories: []
                }
            }

            let importedQuests = this.getImportedQuests();

            this.quests = this.resolveQuests(sourceQuests, importedQuests);
            
            return this.quests;
        } finally {
            this.fetching = false;
        }
    }

    getQuestsSource() {
        switch(this.settings.getQuestsSourceType()){
            case QuestsSourceType.Local:
                return chrome.runtime.getURL('quests.json');
            case QuestsSourceType.GitHub:
                return "https://an-individual.github.io/fl-quests/published/quests.json";
            case QuestsSourceType.Custom:
                return this.settings.getCustomQuestsSource();
            default:
                return "";
        }
    }

    async fetchQuestsFromSource() {
        if(this.questsRaw){
            return JSON.parse(this.questsRaw);
        }

        while(this.fetchingRaw) {
            await new Promise(r => setTimeout(r, 10));
            if(this.questsRaw) {
                return JSON.parse(this.questsRaw);
            }
        }
        try {
            Logger.log("Fetching quests from source.");

            this.fetchingRaw = true;
            let questsSource = this.getQuestsSource();

            if(!questsSource) {
                Logger.log(`No quests source specified`);
                return;
            } else {
                Logger.log(`Quests Source: ${questsSource}`);
            }

            const isRemoteSource = this.settings.getQuestsSourceType() != QuestsSourceType.Local;
            if(isRemoteSource) {
                const previousFetchRaw = this.settings.getSourceQuests();
                if(previousFetchRaw) {
                    const prevFetch = JSON.parse(previousFetchRaw);
                    if(prevFetch.source == questsSource && prevFetch.date) {
                        if(Date.now() - prevFetch.date < this.refetchGracePeriod) {
                            Logger.log("Using previously fetch")
                            this.questsRaw = previousFetchRaw;
                            return prevFetch;
                        }
                    }
                }
            }

            let response = await fetch(questsSource);

            if(!response.ok) {
                throw new Error("HTTP error: " + response.status);
            }

            let fetchedQuests = await response.json();

            this.validator.validate(fetchedQuests);

            Logger.log(`Source Quests Version: ${fetchedQuests.version}`);
            Logger.log(`Fetched ${fetchedQuests.categories.length} Quest Categories From Source`);

            if(isRemoteSource) {
                fetchedQuests.source = questsSource;
                fetchedQuests.date = Date.now();
            }

            // It's actually weirdly important that we stringify and parse
            // the returned object here. If we don't we'll get a cross-origin object
            // error when we try to merge the imported and source quests. Why?
            // Damned if I know.
            this.questsRaw = JSON.stringify(fetchedQuests);
            if(isRemoteSource) {
                this.settings.setSourceQuests(this.questsRaw);
            }
            return JSON.parse(this.questsRaw);
        } finally {
            this.fetchingRaw = false;
        }
    }

    getImportedQuests() {
        try {
            if(!this.settings.getEnableImportedQuests()) {
                return;
            }

            let importedQuestsRaw = this.settings.getImportedQuests();
            if(!importedQuestsRaw){
                return;
            }
            
            let importedQuests = JSON.parse(importedQuestsRaw);

            this.validator.validate(importedQuests, true);

            return importedQuests;
        } catch(error) {
            Logger.error(error);
        }
    }

    resolveQuests(sourceQuests, importedQuests) {
        if(importedQuests) {
            importedQuests.categories.forEach(cat =>{
                cat.isImport = true;
                let idx = sourceQuests.categories.findIndex(c => c.id == cat.id);
                if(idx >= 0) {
                    Logger.log(`Overwrote Category: ${cat.id} (${sourceQuests.categories[idx].title} -> ${cat.title})`);
                    cat.isOverride = true;
                    cat.originalTitle = sourceQuests.categories[idx].title;
                    sourceQuests.categories[idx] = cat;
                } else {
                    Logger.log(`Imported Category: ${cat.id} (${cat.title})`);
                    sourceQuests.categories.push(cat);
                }
            });
        }

        const sortOrderDescending = function(a,b) {
            return b.order - a.order;
        }

        sourceQuests.categories.sort(sortOrderDescending);
        sourceQuests.categories.forEach(cat => {
            cat.quests.sort(sortOrderDescending)
        });

        return sourceQuests;
    }

    async getCategories() {
        let questWrapper = await this.getQuests();
        return questWrapper.categories;
    }
}