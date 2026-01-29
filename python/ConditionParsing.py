def parseCondition(value, mappings):
    elems = splitCondition(value)
    return parseStatement(elems, mappings, None)

# A recursive method to parse the string chunks into
# useful, hierarchical statements. Recursion is
# necessary to handle ANDs and ORs and brackets.
def parseStatement(elems, mappings, prevStatement):
    # No elements is the terminating condition for
    # the recursion so we just return the last statement 
    if len(elems) == 0:
        return prevStatement
    
    # If the next element is a logic string we need to
    # combine the previous statement with the next one.
    logicType = getLogicType(elems[0])
    if logicType != 0:
        if not prevStatement:
            raise Exception("Encountered unexpected logic element: " + elems[0])
        return {
            "Type": logicType,
            "Left": prevStatement,
            "Right": parseStatement(elems[1:], mappings, None)
        }

    # If the next element isn't a logic element, but 
    # we have a previous statement proceeding would
    # discard that statement, which means the condition
    # is malformed.
    if prevStatement:
        raise Exception("Encountered unexpected value following statement: " + elems[0])

    # NOTs just wrap the next conditional statement
    # The way this is written something like !a==3
    # is equivalent to writing !(a==3) which I've
    # decided is fine. The alternative is checking
    # for it and throwing an error.
    if elems[0] == "!":
        if len(elems) <= 1:
            raise Exception("Not logic is not applied to a statement")
        result = parseComparisonStatement(elems[1:len(elems)], mappings)
        statement = {
                "Type": 4,
                "Statement": result["Statement"]
            },
        return parseStatement(elems[result["EndIdx"]+1:], mappings, statement)
    
    # If we've got letters then this is the start of
    # a comparison statement so we throw out to
    # that method.
    if elems[0].isalpha():
        result = parseComparisonStatement(elems, mappings)
        return parseStatement(elems[result["EndIdx"]:], mappings, result["Statement"])
    
    # Finally, if it's an opening bracket we have to
    # find it's terminating bracket, parse the statement
    # that the brackets wrap. The throw that into the
    # recursion along with the remaining elements
    if elems[0] == "(":
        endIdx = findClosingBracket(elems)
        result = parseStatement(elems[1:endIdx], mappings, None)
        return parseStatement(elems[endIdx+1:], mappings, result)

    raise Exception("Encountered unexpected value parsing statement: " + elems[0])

def findClosingBracket(elems):
    bracketDepth = 0
    idx = 0
    while idx < len(elems):
        if elems[idx] == "(":
            bracketDepth += 1
        elif elems[idx] == ")":
            bracketDepth -= 1
            if bracketDepth == 0:
                return idx
            elif bracketDepth < 0:
                raise Exception("Encountered unexpected closing bracket")
    raise Exception("Statement contains unclosed brackets")

def parseComparisonStatement(elems, mappings):
    if len(elems) == 0:
        raise Exception("Unexpected end of statement parsing comparison")
    if not elems[0].isalpha():
        raise Exception("Unexpected value parsing comparision statement: " + elems[0])

    # The default statement is just a check if the named
    # quality exists so we set that up here and modify
    # it later if the statement is more complex
    statement = {
        "Type": 1,
        "Quality": getMapping(elems[0], mappings),
        "Comparison": getComparisonType(">"),
        "Value": 0
    }
    endIdx = 1

    # Check for a specified property
    if len(elems) >= 3 and elems[1] == ".":
        if not elems[2].isalpha():
            raise Exception("Invalid quality property: " + elems[2])
        statement["Property"] = elems[2]
        endIdx = 3

    if endIdx < len(elems):
        comparisonType = getComparisonType(elems[endIdx])
        if not comparisonType == 0:
            statement["Comparison"] = comparisonType
            endIdx += 1
            if endIdx >= len(elems):
                raise Exception("Unexpected end of comparison statement")
            elif not elems[endIdx].isdigit():
                raise Exception("Invalid comparison value: " + elems[endIdx])
            else:
                statement["Value"] = int(elems[endIdx])
                endIdx += 1;

    return {
        "Statement": statement,
        "EndIdx": endIdx
    }
        
def getMapping(name, mappings):
    if not name in mappings:
        raise Exception("No mapping for statement: " + name)
    return mappings[name]

def getComparisonType(value):
    types = {
        "=": 1,
        "==": 1,
        "!=": 2,
        ">": 3,
        ">=": 4,
        "<": 5,
        "<=": 6
    }
    return types.get(value, 0)

def getLogicType(value):
    types = {
        "&": 2,
        "&&": 2,
        "and": 2,
        "|": 3,
        "||": 3,
        "or": 3
    }
    return types.get(value.lower(), 0)

# *********************************************************
# Methods to split condition strings into meaningful chunks
# *********************************************************

def splitCondition(value):
    result = [];
    idx = 0
    while idx < len(value):
        if value[idx].isspace():
            # Do nothing
            idx += 1
        elif value[idx] in '.()':
            result.append(value[idx])
            idx += 1
        elif isLogicChar(value[idx]):
            endIdx = nextNot(value, idx, isLogicChar)
            result.append(value[idx:endIdx])
            idx = endIdx
        elif isComparisionChar(value[idx]):
            endIdx = nextNot(value, idx, isComparisionChar)
            result.append(value[idx:endIdx])
            idx = endIdx
        elif value[idx].isdigit():
            endIdx = nextNot(value, idx, lambda c: c.isdigit())
            result.append(value[idx:endIdx])
            idx = endIdx
        elif value[idx].isalpha():
            endIdx = nextNot(value, idx, lambda c: c.isalpha())
            result.append(value[idx:endIdx])
            idx = endIdx
        else:
            raise Exception("Encountered unknown condition character: " + value[idx])
    return result

def isLogicChar(value):
    return value in "|&"

def isComparisionChar(value):
    return value in "!=<>"

def nextNot(value, index, condition):
    idx = index
    while idx < len(value) and condition(value[idx]):
        idx += 1
    return idx