import json
import os
from os.path import join
from python import QuestParsing

def processCategoryFolder(folder, files):
    print("Compiling Quests in: " + root)

    if not os.path.exists(join(root, "category.json")):
        raise Exception("No catetory.js file defined")
    
    print("    Processing category.json");
    with open(join(root, "category.json"), "r") as catFile:
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
        quest = QuestParsing.processQuestFile(join(root, file))
        category["Quests"].append(quest)
    
    category["Quests"].sort(reverse=True, key=lambda q: q["Order"])

    for quest in category["Quests"]:
        del quest["Order"]

    return category

categories = []
for root, dirs, files in os.walk('./quests'):
    if root == './quests':
        continue
    categories.append(processCategoryFolder(root, files))
    
categories.sort(reverse=True, key=lambda c: c["Order"])
for category in categories:
    del category["Order"]

rawJson = json.dumps(categories);

questsFile = "./extension/quests/quests.json"
os.makedirs(os.path.dirname(questsFile), exist_ok=True)
with open(questsFile, "w") as file:
    file.write(rawJson)