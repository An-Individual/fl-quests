class QuestsCSVParser {
    constructor() {
        this.conditionParser = new ConditionParser();
    }

    parse(csvString) {
        let reader = new CSVReader(csvString);

        let state = {
            rowNumber: 0,
            categories: [],
            currentCategory: null,
            currentQuest: null,
            currentQuestState: null,
            mappings: {}
        };

        while(reader.readRow()) {
            let row = reader.row;
            if(row.length < 4) {
                return {
                    row: reader.rowNumber,
                    column: 0,
                    error: "CSV includes fewer than 4 columns"
                }
            }

            Logger.debug(`Parsing row ${reader.rowNumber}`);

            state.rowNumber = reader.rowNumber;
            let firstCell = row[0]?.trim()?.toLowerCase() ?? "";

            // Skip comment rows.
            if(firstCell.startsWith("//")) {
                continue;
            }
            else if(firstCell == "category") {
                Logger.debug(`Parsing Category`);
                let result = this.parseCategoryRow(row, state);
                if(result?.error){
                    return result;
                }
            } else if(firstCell == "mappings") {
                Logger.debug(`Parsing Mappings`);
                let result = this.parseMappingsRow(row, state);
                if(result?.error) {
                    return result;
                }
            } else if(firstCell == "quest") {
                Logger.debug(`Parsing Quest`);
                let result = this.parseQuestRow(row, state);
                if(result?.error) {
                    return result;
                }
            } else if(this.isIntegerString(firstCell)) {
                Logger.debug(`Parsing Quest State`);
                let result = this.parseQuestStateRow(row, state);
                if(result?.error) {
                    return result;
                }
            } else if(!firstCell) {
                Logger.debug(`Parsing Task`);
                let result = this.parseTaskRow(row, state);
                if(result?.error) {
                    return result;
                }
            } else {
                return {
                    row: reader.rowNumber,
                    column: 0,
                    error: "Unexpected value"
                }
            }
        }

        let check = this.requireClosed(state, true, true);
        if(check.error) {
            return check;
        }

        return {
            categories: state.categories
        }
    }

    isIntegerString(value) {
        return /^\d+$/.test(value);
    }

    isValidIDString(value) {
        return /^\w{1,500}$/.test(value);
    }

    parseCategoryRow(row, state) {
        let check = this.requireClosed(state, true, true);
        if(check.error){
            return check;
        }
        this.undeclare(state, true, true, true);

        let id = row[2]?.trim() ?? "";
        if(!this.isValidIDString(id)) {
            return {
                row: state.rowNumber,
                column:2,
                error: "Category ID is not a valid ID string. ID strings include only letters, numbers, and underscores and have a maximum length of 500 characters."
            }
        }

        let orderString = row[3]?.trim() ?? "";
        if(!this.isIntegerString(orderString)) {
            return {
                row: state.rowNumber,
                column: 3,
                error: "Category order is not a valid integer."
            }
        }
        let order = parseInt(orderString);

        if(!row[1]?.trim()) {
            return {
                row: state.rowNumber,
                column: 1,
                error: "Category title is empty."
            }
        }

        let cat = {
            id: id,
            title: row[1].trim(),
            order: order,
            quests: []
        };

        state.categories.push(cat);
        state.currentCategory = cat;
    }

    parseMappingsRow(row, state) {
        let matches = row[1]?.match(/[a-zA-Z]+=\d+/g);
        if(!matches) {
            return {
                row: state.rowNumber,
                column: 1,
                error: "No mappings found"
            }
        }
        
        matches.forEach(match => {
            let pair = match.split("=");
            state.mappings[pair[0]] = parseInt(pair[1]);
        });
    }

    parseQuestRow(row, state) {
        let check = this.requireDeclared(state, true);
        if(check.error) {
            return check;
        }
        check = this.requireClosed(state, false, true);
        if(check.error) {
            return check;
        }
        this.undeclare(state, false, true, true);

        let orderString = row[2]?.trim() ?? "";
        if(!this.isIntegerString(orderString)) {
            return {
                row: state.rowNumber,
                column: 2,
                error: "Quest order is not a valid integer."
            }
        }
        let order = parseInt(orderString);

        if(!row[1]?.trim()) {
            return {
                row: state.rowNumber,
                column: 1,
                error: "Quest title is empty."
            }
        }

        let quest = {
            title: row[1],
            order: order,
            states: []
        };

        state.currentCategory.quests.push(quest);
        state.currentQuest = quest;
    }

    parseQuestStateRow(row, state) {
        let check = this.requireDeclared(state, true, true);
        if(check.error) {
            return check;
        }
        this.undeclare(state, false, false, true);

        let questState = parseInt(row[0]);
        if(questState < 1 || questState > 5) {
            return {
                row: state.rowNumber,
                column: 0,
                error: "Invalid quest state type: " + questState
            }
        }

        if(!row[1]?.trim()) {
            return {
                row: state.rowNumber,
                column: 1,
                error: "Quest state description is empty."
            }
        }

        let condition = this.conditionParser.parse(row[2], state.mappings);
        if(!condition) {
            return {
                row: state.rowNumber,
                column: 2,
                error: "Quest state condition is empty or malformed."
            }
        }
        if(condition.error){
            return condition;
        }

        let result = {
            state: questState,
            description: row[1],
            condition: condition,
            tasks: []
        };

        state.currentQuest.states.push(result);
        state.currentQuestState = result;
    }

    parseTaskRow(row, state) {
        let check = this.requireDeclared(state, true, true, true);
        if(check.error) {
            return check;
        }

        if(!row[1]?.trim()) {
            return {
                row: state.rowNumber,
                column: 1,
                error: "Task description is empty."
            }
        }

        let completeCondition = this.conditionParser.parse(row[2], state.mappings);
        if(!completeCondition) {
            return {
                row: state.rowNumber,
                column: 2,
                error: "Task completed condition is empty or malformed."
            }
        }

        let result = {
            description: row[1],
            completed: completeCondition
        }

        let visibleCondition = this.conditionParser.parse(row[3], state.mappings);
        if(visibleCondition) {
            result.visible = visibleCondition;
        }

        state.currentQuestState.tasks.push(result);
    }

    requireClosed(state, category, quest) {
        if(category && state.currentCategory) {
            if(state.currentCategory.quests.length == 0){
                return {
                    row: state.rowNumber,
                    column: 0,
                    error: "Category did not declare any quests."
                }
            }
        }

        if(quest && state.currentQuest) {
            if(state.currentQuest.states.length == 0) {
                return {
                    row: state.rowNumber,
                    column: 0,
                    error: "Quest did not declare any states."
                }
            }
        }

        return true;
    }

    requireDeclared(state, category, quest, questState) {
        if(category && !state.currentCategory) {
            return {
                row: state.rowNumber,
                column: 0,
                error: "A category has not been declared."
            }
        }

        if(quest && !state.currentQuest) {
            return {
                row: state.rowNumber,
                column: 0,
                error: "A quest has not been declared."
            }
        }

        if(questState && !state.currentQuestState) {
            return {
                row: state.rowNumber,
                column: 0,
                error: "A quest state has not been declared."
            }
        }

        return true;
    }

    undeclare(state, category, quest, questState) {
        if(category) {
            state.currentCategory = null;
        }

        if(quest){
            state.currentQuest = null;
        }

        if(questState) {
            state.currentQuestState = null;
        }

        return true;
    }
}