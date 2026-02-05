class QuestsManager {

    constructor() {
        this.qualities = QualityTracker.instance();
        this.settings = SettingsManager.instance();
        this.validator = new QuestsValidator();
        this.getQuests()
    }

    clear() {
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
            Logger.log("Fetching quests from source.");

            let sourceQuests = await this.fetchQuestsFromSource();

            if(sourceQuests) {
                Logger.log(`Source Quests Version: ${sourceQuests.version}`);
                Logger.log(`Fetched ${sourceQuests.categories.length} Quest Categories From Source`);
            } else {
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
                source = chrome.runtime.getURL('quests/quests.json');
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
        let questsSource = this.getQuestsSource();

        if(!questsSource) {
            Logger.log(`No quests source specified`);
            return;
        } else {
            Logger.log(`Quests Source: ${questsSource}`);
        }

        let response = await fetch(questsSource);

        if(!response.ok) {
            throw new Error("HTTP error: " + response.status);
        }

        let fetchedQuests = await response.json();

        let validateResult = this.validator.validate(fetchedQuests);
        if(!validateResult.valid)
        {
            throw new Error("Quests Validation Failed: " + validateResult.reason);
        }

        return fetchedQuests;
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

            Logger.log("Parsing imported quests");
            
            let importedQuests = JSON.parse(importedQuestsRaw);

            let validateResult = this.validator.validate(importedQuests, true);
            if(!validateResult.valid)
            {
                Logger.error("Imported Quests Invalid: " + validateResult.reason);
                return;
            }

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
        categoryList.forEach(category => {
            if(!category.quests) {
                return;
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
        });

        return result;
    }

    renderQuest(quest)
    {
        if(!quest.title) {
            throw new Error("Quest does not define a title.");
        }

        if(!quest.states || quest.states.length == 0) {
            throw new Error("Quest does not define any states.");
        }

        let result = {
            "title": quest.title,
            "subtasks": []
        }

        let state;
        for (let i = 0; i < quest.states.length; i++)
        {
            state = quest.states[i];
            if(this.evaluateCondition(state.condition))
            {
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
                if(!task.description) {
                    throw new Error("Sub task does not include a description condition.")
                }

                if(!task.completed) {
                    throw new Error("Sub task does not include a completed condition.")
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
        switch(condition.type) {
            case LogicTypes.And:
                return this.evaluateCondition(condition.left) && this.evaluateCondition(condition.right);
            case LogicTypes.Or:
                return this.evaluateCondition(condition.left) || this.evaluateCondition(condition.right);
            case LogicTypes.Not:
                return !this.evaluateCondition(condition.statement);
            case LogicTypes.Comparison:
                return this.evaluateComparison(condition);
            default:
                throw new Error("Unknown condition type: " + condition.type);
        }
    }

    evaluateComparison(comparision) {
        if (!comparision.quality) {
            throw new Error("Quality comparision does not specify a quality.");
        }

        if(!Object.hasOwn(comparision, "value")) {
            throw new Error("Quality comparision does not specify a value.");
        }

        let value = this.qualities.getValue(comparision.quality, comparision.property);

        switch(comparision.comparison) {
            case ComparisionTypes.Equal:
                return value == comparision.value;
            case ComparisionTypes.NotEqual:
                return value != comparision.value;
            case ComparisionTypes.Greater:
                return value > comparision.value;
            case ComparisionTypes.GreaterEqual:
                return value >= comparision.value;
            case ComparisionTypes.Less:
                return value < comparision.value;
            case ComparisionTypes.LessEqual:
                return value <= comparision.value;
            default:
                throw new Error("Unknown comparison type: " + comparision.comparison);
        }
    }
}