class ConditionError extends Error {
    constructor(position, message) {
        super(`Condition error at position ${position}: ${message}`);
        this.position = position;
    }
}

class ConditionParser {
    parse(condition, mappings) {
        try {
            let reader = new ConditionReader(condition);
            reader.next();
            return this.parseStatement(reader, mappings);
        } catch (error) {
            return {
                error: error.message
            }
        }
    }

    parseStatement(reader, mappings, prevResult, bracketDepth)
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

        // If we're at the end of the string we
        // just return. This is the terminating
        // case for our recursion.
        if(!elem) {
            return prevResult;
        }

        // Similar to the above, if we know we're
        // inside brackets a closing bracket is
        // treated the same as a string end. If
        // we aren't inside brackets we let execution
        // continue to hit the unexpected character
        // handling.
        if(elem == ")" && bracketDepth) {
            return prevResult;
        }

        // This is the reason for including the previous
        // statement in our recursion. If we encounter
        // an AND or OR the statement we return has
        // to wrap the previous statement and the next.
        let logicType = this.getLogicType(elem);
        if(logicType) {
            if(!prevResult) {
                throw new ConditionError(reader.lastIndex, "No left hand side to logic statement.");
            }

            reader.nextThrowIfEnd();
            let rightResult = this.parseStatement(reader, mappings, null, bracketDepth);

            let statement = {
                type: logicType,
                left: prevResult,
                right: rightResult
            };

            return this.parseStatement(reader, mappings, statement, bracketDepth);
        }

        // If we get past the logic wrapping step and
        // aren't at the end of string or bracket then
        // we have a sequence of statements with no
        // logic linking them and have to fail.
        if(prevResult) {
            throw new ConditionError(reader.lastIndex, `Unexpected element '${elem}'`);
        }

        let result;
        if(elem == "!") {
            // NOTs just wrap the next statement. The way 
            // this is written something like !a==3 is 
            // equivalent to wriring !(a==3) which I've
            // decided is fine for the sake of keeping the
            // code reasonably simple.
            reader.nextThrowIfEnd();
            let subResult = this.parseStatement(reader, mappings, null, bracketDepth);
            if(!subResult) {
                throw new ConditionError(reader.lastIndex, "No statement following a NOT.");
            }
            result = {
                type: LogicTypes.Not,
                statement: subResult
            }
        } else if(elem == "(") {
            let openIdx = reader.lastIndex;
            reader.nextThrowIfEnd();
            result = this.parseStatement(reader, mappings, null, (bracketDepth ?? 0) + 1);
            if(reader.last != ")") {
                throw new ConditionError(openIdx, "Bracket not closed.");
            }
            reader.next();
        } else if(this.isLetterString(elem)) {
            result = this.parseComparision(elem, reader, mappings);
        } else {
            throw new ConditionError(reader.lastIndex, `Unknown element '${elem}'`);
        }

        return this.parseStatement(reader, mappings, result, bracketDepth);
    }

    parseComparision(elem, reader, mappings) {
        let quality = mappings[elem];
        if(!quality) {
            throw new ConditionError(reader.lastIndex, `No mapping for '${elem}'`);
        }

        // A quality without a comparision statement
        // is just a check to see if that quality exists
        // so we initialize that now.
        let statement = {
            type: LogicTypes.Comparison,
            quality: quality,
            comparison: ComparisonTypes.Greater,
            value: 0
        }

        let next = reader.next();
        if(next == ".") {
            next = reader.nextThrowIfEnd();
            if(!this.isLetterString(next)) {
                throw new ConditionError(reader.lastIndex, `Invalid quality property '${next}'`);
            }
            if(!AllowedQualityProperties.includes(next)) {
                throw new ConditionError(reader.lastIndex, `Unknown quality property '${next}'`);
            }
            statement.property = next;
            next = reader.next();
        }

        let comparisonType = this.getComparisonType(next);
        if(comparisonType) {
            statement.comparison = comparisonType;
            next = reader.nextThrowIfEnd();
            if(!this.isNumberString(next)) {
                throw new ConditionError(reader.lastIndex, `Comparision value '${next}' is not number.`);
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
                return ComparisonTypes.Equal;
            case "!=":
                return ComparisonTypes.NotEqual;
            case ">":
                return ComparisonTypes.Greater;
            case ">=":
                return ComparisonTypes.GreaterEqual;
            case "<":
                return ComparisonTypes.Less;
            case "<=":
                return ComparisonTypes.LessEqual;
            default:
                return ComparisonTypes.Undefined;
        }
    }

    isLetterString(value) {
        return /^[a-zA-Z]+$/.test(value);
    }

    isNumberString(value) {
        return /^[0-9]+$/.test(value);
    }
}