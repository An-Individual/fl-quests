import { QuestsCSVParser } from "../src/quests/quests-csv-parser.js";
import { QuestsValidator } from "../src/quests/quests-validator.js";
import * as fs from "fs";

const parser = new QuestsCSVParser();
const validator = new QuestsValidator();
const definitionsDir = "./quests/definitions/";
const outputFile = "./extension/quests.json"

const version = fs.readFileSync(definitionsDir + "version.txt").toString().trim();
if(!version) {
    console.error(`No version string defined in ${definitionsDir}version.txt`);
}

const quests = {
    version: version,
    categories: []
};
const files = fs.readdirSync(definitionsDir);
for(let i = 0; i < files.length; i++) {
    const file = files[i];
    if(!file.endsWith(".csv")) {
        continue;
    }
    console.log(`Processing ${file}`);
    const csvString = fs.readFileSync(definitionsDir + file).toString();
    const parsedQuests = parser.parse(csvString);
    if(!parsedQuests) {
        throw new Error("No quests returned");
    }
    if(parsedQuests.error) {
        throw new Error(parsedQuests.error);
    }
    if(!parsedQuests.categories) {
        throw new Error("No categories returned");
    }

    parsedQuests.categories.forEach(cat =>{
        console.log(`    New Category: ${cat.id}`);
        quests.categories.push(cat);
    });
}

console.log("Validating Quest JSON");
validator.validate(quests);

fs.writeFileSync(outputFile, JSON.stringify(quests))