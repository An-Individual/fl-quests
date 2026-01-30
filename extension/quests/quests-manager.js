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

        const response = await fetch(this.settings.getQuestsSource());

        if(!response.ok) {
            throw new Error("HTTP error: " + response.status);
        }

        let fetchedQuests = await response.json();

        let validateResult = this.validator.validate(fetchedQuests);
        if(!validateResult.valid)
        {
            throw new Error("Quests Validation Failed: " + validateResult.reason);
        }

        this.quests = fetchedQuests;
        return this.quests;
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