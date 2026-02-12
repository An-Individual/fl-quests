import { LogicTypes, AllowedQualityProperties } from "./quests-datatypes.js";

export class QuestsValidationError extends Error{
    constructor(property, message) {
        super(`${property}: ${message}`);
    }

    addElemStack(name) {
        this.message = `${name} -> ${this.message}`;
    }
}

export class QuestsValidator {
    validate(quests, ignoreVersion) {
        if(!quests) {
            throw new Error("Quests JSON was undefined");
        }

        if(!ignoreVersion){
            this.isValidStringProperty(quests.version, "Version Property Error");
        }

        this.isValidArray(quests.categories, "Category List Error", true);

        for (const idx in quests.categories) {
            try {
                this.validateCategory(quests.categories[idx]);
            }catch(error) {
                
                error.addElemStack?.(`Category ${idx + 1}`);
                throw error;
            }
        }

        let existingIds = [];
        for (const idx in quests.categories) {
            if(existingIds.indexOf(quests.categories[idx].id) >= 0) {
                throw new Error("Category ID Not Unique: " + quests.categories[idx].id);
            }
            existingIds.push(quests.categories[idx].id);
        }
    }

    validateCategory(category) {
        this.isValidIDProperty(category.id, "ID Error");
        this.isValidStringProperty(category.title, "Title Error");
        this.isValidInteger(category.order, "Order Error");
        this.isValidArray(category.quests, "Quest List Error", true);

        for(const idx in category.quests) {
            try {
                this.validateQuest(category.quests[idx]);
            }catch(error) {
                error.addElemStack?.(`Quest ${idx + 1}`);
                throw error;
            }
        }
    }

    validateQuest(quest) {
        this.isValidStringProperty(quest.title, "Title Error");
        this.isValidInteger(quest.order, "Order Error");
        this.isValidArray(quest.states, "States Error", true);
        
        for(const idx in quest.states) {
            try {
                this.validateState(quest.states[idx]);
            } catch (error) {
                error.addElemStack?.(`State ${idx + 1}`);
                throw error;
            }
        }
    }

    validateState(state) {
        this.isValidInteger(state.state, "Type Error", 1, 5);
        this.isValidStringProperty(state.description, "Description Error");
        this.validateCondition(state.condition);

        if(state.tasks) {
            this.isValidArray(state.tasks, "Tasks Error");

            for(const idx in state.tasks) {
                this.validateTask(state.tasks[idx], idx);
            }
        }
    }

    validateTask(task, taskIndex) {
        this.isValidStringProperty(task.description, `Task ${taskIndex + 1} Description Error`);

        try {
            this.validateCondition(task.completed);
        } catch (error) {
            error.addElemStack?.(`Task ${taskIndex + 1} Completed`);
            throw error;
        }

        if(task.visible) {
            try {
                this.validateCondition(task.visible);
            } catch (error) {
                error.addElemStack?.(`Task ${taskIndex + 1} Visible`);
                throw error;
            }
        }
    }

    validateCondition(condition) {
        if(!condition){
            throw new QuestsValidationError("Condition Error", "Undefined");
        }

        this.isValidInteger(condition.type, "Condition Type Error", 1, 4);

        switch(condition.type) {
            case LogicTypes.And:
            case LogicTypes.Or:
                this.validateCondition(condition.left);
                this.validateCondition(condition.right);
                break;
            case LogicTypes.Not:
                this.validateCondition(condition.statement);
                break;
            case LogicTypes.Comparison:
                this.isValidInteger(condition.quality, "Condition Quality Error");
                if(condition.property) {
                    check = this.isValidStringProperty(condition.property, "Condition Property Error");
                    if(!AllowedQualityProperties.includes(check.property)) {
                        throw new QuestsValidationError("Condition Property Error", `Unknown quality property "${check.property}"`);
                    }
                }

                this.isValidInteger(condition.value, "Condition Value Error");
                this.isValidInteger(condition.comparison, "Condition Comparison Error", 1, 6);
                break;
            default:
                throw new QuestsValidationError("Condition Error", `Unknown condition type "${condition.type}"`);
        }
    }

    isValidStringProperty(propValue, message) {
        if(!propValue) {
            throw new QuestsValidationError(message, "Undefined");
        }

        if(!this.isString(propValue)) {
            throw new QuestsValidationError(message, `Not a string`);
        }
    }

    isValidIDProperty(propValue, message) {
        this.isValidStringProperty(propValue, message);

        if(!/^\w{1,500}$/.test(propValue)) {
            throw new QuestsValidationError(message, `IDs must contain only letters, numbers, and underscores and be fewer than 500 characters.`);
        }
    }

    isValidArray(propValue, message, requireValues){
        if(!propValue) {
            throw new QuestsValidationError(message, `Undefined`);
        }

        if(!Array.isArray(propValue)) {
            throw new QuestsValidationError(message, `Not an Array`);
        }

        if(requireValues && propValue.length == 0) {
            throw new QuestsValidationError(message, `Is Empty`);
        }
    }

    isValidInteger(propValue, message, minValue, maxValue){
        if(!Number.isInteger(propValue)){
            throw new QuestsValidationError(message, `Is not an Integer`);
        }

        // This will break if either value is 0
        // but I've carefully avoided using 0 as
        // a valid value so we're just going to
        // ignore that.
        if(minValue && maxValue)
        {
            if(propValue < minValue || propValue > maxValue) {
                throw new QuestsValidationError(message, `Invalid value`);
            }
        }
    }

    isString(obj) {
        return typeof obj === "string" || obj instanceof String;
    }
}