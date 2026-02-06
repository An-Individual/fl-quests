class ConditionParser {
    parse(condition, mappings) {
        let elems = this.splitCondition(condition);
        let result = this.parseStatement(elems, mappings);
        if(result.error){
            return result;
        }
        return result.value;
    }

    /**
     * A recursive method to parse the string chunks into
     * useful, hierarchical statements.
     */
    parseStatement(elems, mappings, prevResult) {
        // No remaining elements is the terminating condition for
        // the recursion so we just return the last statement.
        if(elems.length == 0) {
            return prevResult;
        }

        // If the next element is a logic string we need to
        // combine the previous statement with the next one.
        let logicType = this.getLogicType(elems[0].value);
        if(logicType) {
            if(!prevResult) {
                return {
                    error: `Condition error at position ${elems[0].position}: No left hand side to logic statement.`
                };
            }

            let rightResult = this.parseStatement(elems.slice(1), mappings);
            if(rightResult.error) {
                return rightResult;
            }

            let statement = {
                type: logicType,
                left: prevResult.value,
                right: rightResult.value
            }

            let logicResult = {
                value: statement,
                count: prevResult.count + rightResult.count + 1
            }

            return this.parseStatement(elems.slice(rightResult.count + 1), mappings, logicResult)
        }

        // If we have a previous statement and we pass this
        // point we would discard it which means the condition
        // is malformed.
        if(prevResult) {
            return {
                error: `Condition error at position ${elems[0].position}: No logical link between statements.`
            };
        }

        let result = {
            count: 0,
            value: null
        }

        if(elems[0].value == "!") {
            // NOTs just wrap the next conditional statement
            // The way this is written something like !a==3
            // is equivalent to wriring !(a==3) which I've
            // decided is fine for the sake of keeping the
            // code reasonably simple.
            if(elems.length <= 1) {
                return {
                    error: `Condition error at position ${elems[0].position}: No statement following a NOT.`
                };
            }
            let subResult = this.parseStatement(elems.slice(1), mappings);
            if(subResult.error){
                return subStatement;
            }
            let statement = {
                type: LogicTypes.Not,
                statement: subResult.value
            }

            result.value = statement;
            result.count = subResult.count + 1;
        } else if(elems[0].value == "(") {
            // For brackets we just have to find the closing
            // bracket, run the statement parser on the elements
            // between them, and expand the count of used
            // elements to include the brackets.
            let endIdx = this.findClosingBracket(elems);
            if(endIdx.error){
                return endIdx;
            }

            result = this.parseStatement(elems.slice(1,endIdx),mappings);
            if(result.error){
                return result;
            }
            result.count += 2;
        } else if(this.isLetterString(elems[0].value)) {
            result = this.parseComparision(elems, mappings);
            if(result.error) {
                return result;
            }
        } else {
            return {
                error: `Condition error at position ${elems[0].position}: Unexpected element ${elems[0].value}`
            };
        }

        return this.parseStatement(elems.slice(result.count), mappings, result);
    }

    getLogicType(value) {
        switch(value) {
            case "&":
            case "&&":
                return LogicTypes.And;
            case "|":
            case "||":
                return LogicTypes.Or;
            default:
                return LogicTypes.Undefined;
        }
    }

    splitCondition(value) {
        let reader = new ConditionReader(value);
        let result = [];
        while(reader.next()) {
            result.push({
                value: reader.last,
                position: reader.lastIndex
            })
        }

        return result;
    }

    findClosingBracket(elems) {
        let bracketDepth = 0;
        let idx = 0;
        while(idx < elems.length) {
            if(elems[idx].value == "(") {
                bracketDepth++;
            } else if (elems[idx].value == ")") {
                bracketDepth--;
                if(bracketDepth == 0) {
                    return idx;
                } else if(bracketDepth < 0) {
                    return {
                        error: `Condition error at position ${elems[idx].position}: Encountered unexpected closing bracket.`
                    }
                }
            }
        }
        return {
            error: `Condition error at position ${elems[0].position}: Bracket not closed.`
        };
    }

    parseComparision(elems, mappings) {
        let quality = mappings[elems[0].value];
        if(!quality) {
            return {
                error: `Condition error at position ${elems[0].position}: No mapping for "${elems[0].value}".`
            };
        }

        // A quality without a comparision statement
        // is just a check to see if that quality exists
        // so we initialize that now.
        let statement = {
            type: LogicTypes.Comparison,
            quality: quality,
            comparision: ComparisionTypes.Greater,
            value: 0
        }

        let idx = 1;
        if(idx < elems.length && elems[idx].value == ".") {
            idx++;
            if(idx >= elems.length) {
                return {
                    error: `Condition error at position ${elems[idx-1].position}: Quality property incomplete.`
                };
            }
            if(!this.isLetterString(elems[idx].value)) {
                return {
                    error: `Condition error at position ${elems[idx].position}: Invalid quality property "${elems[idx].value}"`
                };
            }
            statement.property = elems[idx].value;
            idx++;
        }

        if(idx < elems.length) {
            let comparisonType = this.getComparisonType(elems[idx].value);
            if(comparisonType) {
                idx++;
                if(idx >= elems.length) {
                    return {
                        error: `Condition error at position ${elems[idx-1].position}: Comparision statement is missing value."`
                    };
                }
                if(!this.isNumberString(elems[idx].value)) {
                    return {
                        error: `Condition error at position ${elems[idx].position}: Comparision value "${elems[idx].value}" is not number.`
                    };
                }
                statement.value = parseInt(elems[idx]);
                idx++;
            }
        }

        return {
            value: statement,
            count: idx 
        };
    }

    getComparisonType(value) {
        switch(value) {
            case "=":
            case "==":
                return ComparisionTypes.Equal;
            case "!=":
                return ComparisionTypes.NotEqual;
            case ">":
                return ComparisionTypes.Greater;
            case ">=":
                return ComparisionTypes.GreaterEqual;
            case "<":
                return ComparisionTypes.Less;
            case "<=":
                return ComparisionTypes.LessEqual;
            default:
                return ComparisionTypes.Undefined;
        }
    }

    isLetterString(value) {
        return /^[a-zA-Z]+$/.test(value);
    }

    isNumberString(value) {
        return /^[0-9]+$/.test(value);
    }
}