import csv
import os
from os.path import join
from python import ConditionParsing

def processQuestFile(file):
    quest = {
        "States": []
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
                quest["Order"] = int(line[0])
                quest["Title"] = line[1]
                mappings = parseIdMappings(line[2])
            elif row == 2:
                # Row 2 is just headings so no action taken.
                continue
            else:
                if not line[0]:
                    # If the first column is empty then this
                    # is a sub task
                    quest["States"][-1]["Tasks"].append(processSubtaskRow(line, mappings))
                else:
                    quest["States"].append(processStateRow(line, mappings))
    quest["States"].reverse()
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
    condition = ConditionParsing.parseCondition(row[2], mappings)
    if not condition:
        raise Exception("State row lacks logic")
    return {
        "State": int(row[0]),
        "Description": row[1],
        "Condition": condition
    }

def processSubtaskRow(row, mappings):
    completed = ConditionParsing.parseCondition(row[2])
    if not completed:
        raise Exception("Task row lacks logic to mark it completed")

    result = {
        "Description": row[1],
        "Completed": completed
    }

    if len(row) >= 4:
        visible = ConditionParsing.parseCondition(row[3])
        if visible:
            result["Visible"] = visible

    return result