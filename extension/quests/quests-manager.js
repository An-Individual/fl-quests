class QuestsManager {

    constructor(qualityManager) {
        this.qualities = qualityManager;
        this.getQuests()
    }

    clear() {
        this.quests = null;
    }

    async getQuests() {
        if(this.quests) {
            return this.quests
        }

        const response = await fetch(Settings.getQuestsSource());

        if(!response.ok) {
            throw new Error("HTTP error: " + response.status);
        }

        this.quests = await response.json();
        return this.quests;
    }

    async getCategories() {
        let questWrapper = await this.getQuests();
        return questWrapper.Categories;
    }

    async renderQuests() {
        let categoryList = await this.getCategories();
        let result = [];
        categoryList.forEach(category => {
            if(!category.Quests) {
                return;
            }

            let outputCat = {
                "id": category.ID,
                "title": category.Title,
                "quests": []
            }

            category.Quests.forEach(quest =>{
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
        if(!quest.Title) {
            throw new Error("Quest does not define a title.");
        }

        if(!quest.States || quest.States.length == 0) {
            throw new Error("Quest does not define any states.");
        }

        let result = {
            "title": quest.Title,
            "subtasks": []
        }

        let state;
        for (let i = 0; i < quest.States.length; i++)
        {
            state = quest.States[i];
            if(this.evaluateCondition(state.Condition))
            {
                break;
            }
        }

        if(!state) {
            return null;
        }

        result.state = state.State;
        result.details = state.Description;

        if(state.Tasks) {
            state.Tasks.forEach(task =>{
                if(!task.Description) {
                    throw new Error("Sub task does not include a description condition.")
                }

                if(!task.Completed) {
                    throw new Error("Sub task does not include a completed condition.")
                }

                if(task.Visible && !this.evaluateCondition(task.Visible)) {
                    return;
                }

                result.subtasks.push({
                    "description": task.Description,
                    "completed": this.evaluateCondition(task.Completed)
                })
            });
        }

        return result;
    }

    evaluateCondition(condition) {
        switch(condition.Type) {
            case LogicTypes.And:
                return this.evaluateCondition(condition.Left) && this.evaluateCondition(condition.Right);
            case LogicTypes.Or:
                return this.evaluateCondition(condition.Left) || this.evaluateCondition(condition.Right);
            case LogicTypes.Not:
                return !this.evaluateCondition(condition.Statement);
            case LogicTypes.Comparison:
                return this.evaluateComparison(condition);
            default:
                throw new Error("Unknown condition type: " + condition.Type);
        }
    }

    evaluateComparison(comparision) {
        if (!comparision.Quality) {
            throw new Error("Quality comparision does not specify a quality.");
        }

        if(!Object.hasOwn(comparision, "Value")) {
            throw new Error("Quality comparision does not specify a value.");
        }

        let value = this.qualities.getValue(comparision.Quality, comparision.Property);

        switch(comparision.Comparison) {
            case ComparisionTypes.Equal:
                return value == comparision.Value;
            case ComparisionTypes.NotEqual:
                return value != comparision.Value;
            case ComparisionTypes.Greater:
                return value > comparision.Value;
            case ComparisionTypes.GreaterEqual:
                return value >= comparision.Value;
            case ComparisionTypes.Less:
                return value < comparision.Value;
            case ComparisionTypes.LessEqual:
                return value <= comparision.Value;
            default:
                throw new Error("Unknown comparison type: " + comparision.Comparison);
        }
    }
}

const Quests = new QuestsManager(Qualities);