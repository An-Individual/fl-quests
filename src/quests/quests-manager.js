import { QualityTracker } from "../qualities/quality-tracker.js";
import { SettingsManager } from "../settings.js";
import { QuestsValidator } from "./quests-validator.js";
import { Logger } from "../logger.js";
import { QuestsSourceType, LogicTypes, ComparisonTypes } from "./quests-datatypes.js";

export class QuestsManager {

    constructor() {
        this.refetchGracePeriod = Temporal.Duration.from({ hours: 12}).total("milliseconds");
        this.qualities = QualityTracker.instance();
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
        let source;
        switch(this.settings.getQuestsSourceType()){
            case QuestsSourceType.Local:
                source = chrome.runtime.getURL('quests.json');
                break;
            case QuestsSourceType.GitHub:
                throw new Error("NOT IMPLEMENTED");
            case QuestsSourceType.Custom:
                source = this.settings.getCustomQuestsSource();
                break;
            default:
                source = "";
                break;
        }

        return source;
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

    async renderQuests() {
        let categoryList = await this.getCategories();
        let result = [];
        for(let i = 0; i < categoryList.length; i++) {
            let category = categoryList[i];
            if(!category.quests) {
                continue;
            }

            let outputCat = {
                "id": category.id,
                "title": category.title,
                "quests": []
            }

            category.quests.forEach(quest =>{
                let outputQuest = this.renderQuest(quest);
                if(outputQuest){
                    outputCat.quests.push(outputQuest);
                }
            });

            if(outputCat.quests.length > 0) {
                result.push(outputCat);
            }
        }

        return result;
    }

    renderQuest(quest)
    {
        if(!quest || !quest.states) {
            return null;
        }

        let result = {
            "title": quest.title,
            "subtasks": []
        }

        let state;
        for (let i = quest.states.length-1; i >= 0; i--)
        {
            if(this.evaluateCondition(quest.states[i].condition))
            {
                state = quest.states[i];
                break;
            }
        }

        if(!state) {
            return null;
        }

        result.state = state.state;
        result.details = state.description;

        if(state.tasks) {
            state.tasks.forEach(task =>{
                if(!task.completed) {
                    throw new Error("Task does not include a completed condition.")
                }

                if(task.visible && !this.evaluateCondition(task.visible)) {
                    return;
                }

                result.subtasks.push({
                    "description": task.description,
                    "completed": this.evaluateCondition(task.completed)
                })
            });
        }

        return result;
    }

    evaluateCondition(condition) {
        if(!condition) {
            throw new Error("Condition Undefined")
        }
        switch(condition.type) {
            case LogicTypes.And:
                if(!condition.left) {
                    throw new Error("AND left condition undefined.")
                }
                if(!condition.right) {
                    throw new Error("AND right condition undefined.")
                }
                return this.evaluateCondition(condition.left) && this.evaluateCondition(condition.right);
            case LogicTypes.Or:
                if(!condition.left) {
                    throw new Error("OR left condition undefined.")
                }
                if(!condition.right) {
                    throw new Error("OR right condition undefined.")
                }
                return this.evaluateCondition(condition.left) || this.evaluateCondition(condition.right);
            case LogicTypes.Not:
                if(!condition.statement) {
                    throw new Error("NOT statement undefined.");
                }
                return !this.evaluateCondition(condition.statement);
            case LogicTypes.Comparison:
                return this.evaluateComparison(condition);
            default:
                throw new Error("Unknown condition type: " + condition.type);
        }
    }

    evaluateComparison(comparision) {
        if(!comparision) {
            throw new Error("Comparison Undefined");
        }

        if (!comparision.quality) {
            throw new Error("Quality comparision does not specify a quality.");
        }

        if(!Object.hasOwn(comparision, "value")) {
            throw new Error("Quality comparision does not specify a value.");
        }

        let value = this.qualities.getValue(comparision.quality, comparision.property);

        switch(comparision.comparison) {
            case ComparisonTypes.Equal:
                return value == comparision.value;
            case ComparisonTypes.NotEqual:
                return value != comparision.value;
            case ComparisonTypes.Greater:
                return value > comparision.value;
            case ComparisonTypes.GreaterEqual:
                return value >= comparision.value;
            case ComparisonTypes.Less:
                return value < comparision.value;
            case ComparisonTypes.LessEqual:
                return value <= comparision.value;
            default:
                throw new Error("Unknown comparison type: " + comparision.comparison);
        }
    }
}