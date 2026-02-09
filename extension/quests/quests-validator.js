class QuestsValidator {
    validate(quests, ignoreVersion) {
        if(!quests) {
            return this.makeResult(false, "Input was undefined");
        }

        let check;

        if(!ignoreVersion){
            check = this.isValidStringProperty(quests.version);
            if(!check.valid){
                return this.makeResult(false, "Version Property Error: " + check.reason);
            }
        }

        check = this.isValidArray(quests.categories, true);
        if(!check.valid){
            return this.makeResult(false, "Category List Error: " + check.reason);
        }

        for (const idx in quests.categories) {
            let catResult = this.validateCategory(quests.categories[idx]);
            if(!catResult.valid)
            {
                return catResult;
            }
        }

        let existingIds = [];
        for (const idx in quests.categories) {
            if(existingIds.indexOf(quests.categories[idx].id) >= 0) {
                return this.makeResult(false, "Category ID Not Unique: " + quests.categories[idx].id);
            }
            existingIds.push(quests.categories[idx].id);
        }

        return this.makeResult(true);
    }

    validateCategory(category) {
        let check;

        check = this.isValidIDProperty(category.id);
        if(!check.valid) {
            return this.makeResult(false, "Category ID Error: " + check.reason);
        }

        check = this.isValidStringProperty(category.title);
        if(!check.valid) {
            return this.makeResult(false, "Category Title Error: " + check.reason);
        }

        check = this.isValidInteger(category.order);
        if(!check.valid) {
            return this.makeResult(false, "Category Order Error: " + check.reason);
        }

        check = this.isValidArray(category.quests, true);
        if(!check.valid){
            return this.makeResult(false, "Category Quest List Error: " + check.reason);
        }

        for(const idx in category.quests) {
            check = this.validateQuest(category.quests[idx]);
            if(!check.valid){
                return check;
            }
        }

        return this.makeResult(true);
    }

    validateQuest(quest) {
        let check;

        check = this.isValidStringProperty(quest.title);
        if(!check.valid) {
            return this.makeResult(false, "Quest Title Error: " + check.reason);
        }

        check = this.isValidInteger(quest.order);
        if(!check.valid) {
            return this.makeResult(false, "Quest Order Error: " + check.reason);
        }

        check = this.isValidArray(quest.states, true);
        if(!check.valid){
            return this.makeResult(false, "Quest States Error: " + check.reason);
        }
        
        for(const idx in quest.states) {
            check = this.validateState(quest.states[idx]);
            if(!check.valid){
                return check;
            }
        }

        return this.makeResult(true);
    }

    validateState(state) {
        let check;

        check = this.isValidInteger(state.state, 1, 5);
        if(!check.valid) {
            return this.makeResult(false, "Quest State Type Error: " + check.reason);
        }

        check = this.isValidStringProperty(state.description);
        if(!check.valid) {
            return this.makeResult(false, "Quest State Description Error: " + check.reason);
        }

        check = this.validateCondition(state.condition);
        if(!check.valid) {
            return this.makeResult(false, "Quest State Condition Error: " + check.reason);
        }

        if(state.tasks) {
            check = this.isValidArray(state.tasks);
            if(!check.valid) {
                return this.makeResult(false, "Quest State Tasks Error: " + check.reason);
            }

            for(const idx in state.tasks) {
                check = this.validateTask(state.tasks[idx]);
                if(!check.valid){
                    return check;
                }
            }
        }

        return this.makeResult(true);
    }

    validateTask(task) {
        let check;

        check = this.isValidStringProperty(task.description);
        if(!check.valid) {
            return this.makeResult(false, "Task Description Error: " + check.reason);
        }

        check = this.validateCondition(task.completed);
        if(!check.valid) {
            return this.makeResult(false, "Task Completed Error: " + check.reason);
        }

        if(task.visible) {
            check = this.validateCondition(task.visible);
            if(!check.valid) {
                return this.makeResult(false, "Task Visible Error: " + check.reason);
            }
        }

        return this.makeResult(true);
    }

    validateCondition(condition) {
        let check;

        if(!condition){
            return this.makeResult(false, "Condition undefined");
        }

        check = this.isValidInteger(condition.type, 1, 4);
        if(!check.valid) {
            return this.makeResult(false, "Condition Type Error: " + check.reason);
        }

        switch(condition.type) {
            case LogicTypes.And:
            case LogicTypes.Or:
                check = this.validateCondition(condition.left);
                if(!check.valid) {
                    return check;
                }

                check = this.validateCondition(condition.right);
                if(!check.valid) {
                    return check;
                }

                return this.makeResult(true);
            case LogicTypes.Not:
                return this.validateCondition(condition.statement);
            case LogicTypes.Comparison:
                check = this.isValidInteger(condition.quality);
                if(!check.valid){
                    return this.makeResult(false, "Condition Quality Error: " + check.reason);
                }

                if(condition.property) {
                    check = this.isValidStringProperty(condition.property);
                    if(!check.valid){
                        return this.makeResult(false, "Condition Property Error: " + check.reason);
                    }
                    if(!AllowedQualityProperties.includes(check.property)) {
                        return this.makeResult(false, `Condition Property Error: Unknown quality property "${check.property}"`)
                    }
                }

                check = this.isValidInteger(condition.value);
                if(!check.valid){
                    return this.makeResult(false, "Condition Value Error: " + check.reason);
                }

                check = this.isValidInteger(condition.comparison, 1, 6);
                if(!check.valid){
                    return this.makeResult(false, "Condition Comparison Error: " + check.reason);
                }

                return this.makeResult(true);
            default:
                return this.makeResult(false, "No handling defined for condition type");
        }
    }

    isValidStringProperty(propValue) {
        if(!propValue) {
            return this.makeResult(false, "Undefined");
        }

        if(!this.isString(propValue)) {
            return this.makeResult(false, "Not a string");
        }

        return this.makeResult(true);
    }

    isValidIDProperty(propValue) {
        let result = this.isValidStringProperty(propValue);
        if(!result.isValid) {
            return result;
        }

        if(!/^\w{1,500}$/.test(propValue)) {
            return this.makeResult(false, "IDs must contain only letters, numbers, and underscores and be fewer than 500 characters.");
        }
    }

    isValidArray(propValue, requireValues){
        if(!propValue) {
            return this.makeResult(false, "Undefined");
        }

        if(!Array.isArray(propValue)) {
            return this.makeResult(false, "Not an Array");
        }

        if(requireValues && propValue.length == 0) {
            return this.makeResult(false, "Is Empty");
        }

        return this.makeResult(true)
    }

    isValidInteger(propValue, minValue, maxValue){
        if(!Number.isInteger(propValue)){
            return this.makeResult(false, "Is not an Integer");
        }

        // This will break if either value is 0
        // but I've carefully avoided using 0 as
        // a valid value so we're just going to
        // ignore that.
        if(minValue && maxValue)
        {
            if(propValue < minValue || propValue > maxValue) {
                return this.makeResult(false, "Invalid value");
            }
        }

        return this.makeResult(true);
    }

    isString(obj) {
        return typeof obj === "string" || obj instanceof String;
    }

    makeResult(isValid, reason){
        let result = {
            "valid": isValid
        }
        if(reason) {
            result.reason = reason;
        }
        return result;
    }
}