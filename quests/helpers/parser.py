import csv
from . import conditions
from os.path import join

def processQuestFile(file):
    quest = {
        "states": []
    }
    with open(file, "r") as questFile:
        csvFile = csv.reader(questFile)
        row = 0
        mappings = {}
        for line in csvFile:
            row += 1
            if row == 1:
                # The first row contains 3 cells
                # Cell 1 is an order integer
                # Cell 2 is the quest title
                # Cell 3 is a comma separated list of name/number mappings
                quest["order"] = int(line[0])
                quest["title"] = line[1]
                mappings = parseIdMappings(line[2])
            elif row == 2:
                # Row 2 is just headings so no action taken.
                continue
            else:
                if not line[0]:
                    # If the first column is empty then this
                    # is a sub task
                    quest["states"][-1]["tasks"].append(processSubtaskRow(line, mappings))
                else:
                    quest["states"].append(processStateRow(line, mappings))
    quest["states"].reverse()
    return quest

def parseIdMappings(cell):
    result = {}
    for mapping in cell.split(","):
        if not mapping:
            continue

        vals = mapping.split("=")
        if not len(vals) == 2:
            raise Exception("Poorly formatted mapping string: " + cell)

        key = vals[0].strip()
        value = vals[1].strip()
        
        if not key or not key.isalpha():
            raise Exception("Invalid quality mapping string: " + key)

        if not value or not value.isdigit():
            raise Exception("Invalid uality mapping value:" + value)
        
        result[key] = int(value)
    return result

def processStateRow(row, mappings):
    condition = conditions.parseCondition(row[2], mappings)
    if not condition:
        raise Exception("State row lacks logic")
    return {
        "state": int(row[0]),
        "description": row[1],
        "condition": condition
    }

def processSubtaskRow(row, mappings):
    completed = conditions.parseCondition(row[2])
    if not completed:
        raise Exception("Task row lacks logic to mark it completed")

    result = {
        "description": row[1],
        "completed": completed
    }

    if len(row) >= 4:
        visible = conditions.parseCondition(row[3])
        if visible:
            result["visible"] = visible

    return result