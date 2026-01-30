import json
import os
from os.path import join
from helpers import parser

def processCategoryFolder(folder, files):
    print("Compiling Quests in: " + folder)

    if not os.path.exists(join(folder, "category.json")):
        raise Exception("No catetory.js file defined")
    
    print("    Processing category.json");
    with open(join(folder, "category.json"), "r") as catFile:
            categoryDetails = json.load(catFile)
    
    if not categoryDetails["Order"]:
        raise Exception("Category does not include an order.")

    if not isinstance(categoryDetails["Order"], int):
        raise Exception("Category order is not an integer.")

    if not categoryDetails["Title"]:
        raise Exception("Category does not include a title.")
        
    if not categoryDetails["ID"]:
        raise Exception("Category does not include an id.")

    category = {
        "Order": int(categoryDetails["Order"]),
        "Title": categoryDetails["Title"],
        "ID": categoryDetails["ID"],
        "Quests": []
    }

    for file in files:
        if not file.endswith(".csv"):
                continue;

        print("    Processing " + file)
        quest = parser.processQuestFile(join(folder, file))
        category["Quests"].append(quest)
    
    category["Quests"].sort(reverse=True, key=lambda q: q["Order"])

    return category

def readVersion(scriptDir):
    versionPath = join(scriptDir, "./definitions/version.json")
    if not os.path.exists(versionPath):
         raise Exception("Failed to locate version file: " + versionPath)
    print("    Processing version.json")
    with open(versionPath, "r") as verFile:
        versionJson = json.load(verFile)
        return versionJson["version"]

categories = []

questsdir = os.path.dirname(__file__)
version = readVersion(questsdir);
if not version:
    raise Exception("Version string cannot be empty")

for root, dirs, files in os.walk(join(questsdir, './definitions')):
    if root.endswith('./definitions'):
        continue
    categories.append(processCategoryFolder(root, files))
    
categories.sort(reverse=True, key=lambda c: c["Order"])

fullQuests = {
     "Version": version,
     "Categories": categories
}

rawJson = json.dumps(fullQuests)

questsFile = join(questsdir, "../extension/quests/quests.json")
os.makedirs(os.path.dirname(questsFile), exist_ok=True)
with open(questsFile, "w") as file:
    file.write(rawJson)