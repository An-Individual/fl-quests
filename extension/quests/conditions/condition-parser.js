class ConditionParser {
    parse(condition, mappings) {
        try {
            let reader = new ConditionReader(condition);
            reader.next();
            return this.parseStatement(elems, mappings);
        } catch (error) {
            return {
                error: error.message
            }
        }
    }

    parseStatement(reader, mappings, prevResult)
    {
        // We assume that the next thing we need
        // to parse has already been read. This is
        // because we often need to look at the
        // next element in the reader and only
        // act if it matches a certain value or
        // pattern. If it does we handle it in
        // place. If it doesn't we either fail
        // entirely or throw back out to the
        // start of this method.
        let elem = reader.last;

        // If we're at the end of the string, or
        // the closing of a bracket, we just return
        // the last statment. This is the terminating
        // case for our recursion, as well as how we
        // handle the closing of brackets.
        if(!elem || elem == ")") {
            return prevResult;
        }

        // This is the reason for including the previous
        // statement in our recursion. If we encounter
        // an AND or OR the statement we return has
        // to wrap the previous statement and the next.
        let logicType = this.getLogicType(elem);
        if(logicType) {
            if(!prevResult) {
                return {
                    error: `Condition error at position ${reader.lastIndex}: No left hand side to logic statement.`
                };
            }

            reader.nextThrowIfEnd();
            let rightResult = this.parseStatement(reader, mappings);
            if(rightResult?.error) {
                return rightResult;
            }

            let statement = {
                type: logicType,
                left: prevResult.value,
                right: rightResult.value
            }

            return this.parseStatement(reader, mappings, statement)
        }

        // If we get past the logic wrapping step and
        // aren't at the end of string or bracket then
        // we have a sequence of statements with no
        // logic linking them and have to fail.
        if(prevResult) {
            return {
                error: `Condition error at position ${reader.lastIndex}: No logical link between statements.`
            };
        }

        let result;
        if(elem == "!") {
            // NOTs just wrap the next statement. The way 
            // this is written something like !a==3 is 
            // equivalent to wriring !(a==3) which I've
            // decided is fine for the sake of keeping the
            // code reasonably simple.
            reader.nextThrowIfEnd();
            let subResult = this.parseStatement(reader, mappings);
            if(!subResult) {
                return {
                    error: `Condition error at position ${reader.lastIndex}: No statement following a NOT.`
                };
            }
            if(subResult?.error){
                return subResult;
            }
            result = {
                type: LogicTypes.Not,
                statement: subResult.value
            }
        } else if(elem == "(") {
            let openIdx = reader.lastIndex;
            reader.nextThrowIfEnd();
            result = this.parseStatement(reader, mappings);
            if(reader.last != ")") {
                return  {
                    error: `Condition error at position ${openIdx}: bracket not closed.`
                };
            }
            reader.next();
        } else if(this.isLetterString(elem)) {
            result = this.parseComparision(elem, reader, mappings);
            if(result?.error) {
                return result;
            }
        } else {
            return {
                error: `Condition error at position ${reader.lastIndex}: Unexpected element ${elem}`
            };
        }

        return this.parseStatement(reader, mappings, result);
    }

    parseComparision(elem, reader, mappings) {
        let quality = mappings[elem];
        if(!quality) {
            return {
                error: `Condition error at position ${reader.lastIndex}: No mapping for "${elems[0].value}".`
            };
        }

        // A quality without a comparision statement
        // is just a check to see if that quality exists
        // so we initialize that now.
        let statement = {
            type: LogicTypes.Comparison,
            quality: quality,
            comparison: ComparisionTypes.Greater,
            value: 0
        }

        let next = reader.next();
        if(next == ".") {
            next = reader.nextThrowIfEnd();
            if(!this.isLetterString(next)) {
                return {
                    error: `Condition error at position ${reader.lastIndex}: Invalid quality property "${next}"`
                };
            }
            if(!AllowedQualityProperties.includes(next)) {
                return {
                    error: `Condition error at position ${reader.lastIndex}: Unknown quality property "${next}"`
                };
            }
            statement.property = next;
            next = reader.next();
        }

        let comparisonType = this.getComparisonType(next);
        if(comparisonType) {
            statement.comparison = comparisonType;
            next = reader.nextThrowIfEnd();
            if(!this.isNumberString(next)) {
                return {
                    error: `Condition error at position ${reader.lastIndex}: Comparision value "${next}" is not number.`
                };
            }
            statement.value = parseInt(next);
            next = reader.next();
        }

        return statement;
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