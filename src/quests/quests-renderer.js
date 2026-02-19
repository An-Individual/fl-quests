import { QualityTracker } from "../qualities/quality-tracker.js";
import { LogicTypes, ComparisonTypes, QuestSortPriority } from "./quests-datatypes.js";

export class QuestsRenderer {
    constructor(){
        this.qualities = QualityTracker.instance();
    }

    renderQuests(quests) {
        if(!quests || !quests.categories || !quests.categories.length) {
            return [];
        }

        let result = [];
        for(let i = 0; i < quests.categories.length; i++) {
            let category = quests.categories[i];
            if(!category.quests) {
                continue;
            }

            let outputCat = {
                "id": category.id,
                "title": category.title,
                "order": category.order,
                "quests": []
            }

            category.quests.forEach(quest =>{
                let outputQuest = this.renderQuest(quest);
                if(outputQuest){
                    outputCat.quests.push(outputQuest);
                }
            });

            if(outputCat.quests.length > 0) {
                this.sortQuests(outputCat.quests);
                result.push(outputCat);
            }
        }

        return result;
    }

    sortQuests(questList) {
        questList?.sort((a,b) => {
            let typeDif = QuestSortPriority[a.state] - QuestSortPriority[b.state];
            if(typeDif != 0){
                return typeDif;
            }
            return b.order - a.order;
        })
    }

    renderQuest(quest)
    {
        if(!quest || !quest.states) {
            return null;
        }

        let result = {
            title: quest.title,
            order: quest.order ?? 0,
            subtasks: []
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