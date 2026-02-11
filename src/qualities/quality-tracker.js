import { CSVBuilder } from "../csv/csv-builder";
import { CSVReader } from "../csv/csv-reader";

export class QualityTracker {
    constructor() {
        this.qualities = {};
        this.spoofed = false;
    }

    static singleInstance = null;
    static instance() {
        if(this.singleInstance) {
            return this.singleInstance;
        }
        this.singleInstance = new QualityTracker();
        return this.singleInstance;
    }

    get(id){
        if(this.spoofed) {
            return this.spoofedQualities[id];
        }
        return this.qualities[id];
    }

    getAll()
    {
        let qualityList = this.qualities;
        if(this.spoofed) {
            qualityList = this.spoofedQualities;
        }

        let result = [];
        for(const id in qualityList) {
            result.push(qualityList[id]);
        }
        return result;
    }

    getValue(id, property) {
        if(!property) {
            property = "level"
        }
        if(this.spoofed) {
            return this.spoofedQualities[id]?.[property] ?? 0;
        }
        return this.qualities[id]?.[property] ?? 0;
    }

    spoof(fakeQualities) {
        this.spoofed = true;
        this.spoofedQualities = fakeQualities;
    }

    releaseSpoof() {
        this.spoofed = false;
    }

    onMyself(response) {
        let newQualities = {};
        response.possessions.forEach((category) => {
            category.possessions.forEach((quality) =>{
                newQualities[quality.id] = quality;
            });
        });

        this.qualities = newQualities;
    }

    onBranch(response) {
        if (response.messages?.length > 0){
            response.messages.forEach((message) =>{
                if (message.possession){
                    this.qualities[message.possession.id] = message.possession;
                }
            });
        }
    }

    onExchange(response) {
        if (response.possessionsChanged?.length > 0){
            response.possessionsChanged.forEach(quality => {
                this.qualities[quality.id] = quality;
            });
        }
    }

    exportToCSV()
    {
        let qualities = this.getAll();
        const builder = new CSVBuilder();
        
        builder.addRow([
            "id",
            "name",
            "level",
            "effectiveLevel",
            "category",
            "nature"
        ]);

        qualities.forEach(quality => {
            builder.addRow([
                quality.id,
                quality.name,
                quality.level,
                quality.effectiveLevel,
                quality.category,
                quality.nature
            ]);
        });

        return builder.result;
    }

    spoofFromCSV(csvString) {
        const reader = new CSVReader(csvString);
        let result = {};
        let columns = [];
        let spoofCount = 0;
        while(reader.readRow()) {
            if(reader.rowNumber == 1) {
                for(let i = 0; i < reader.row.length; i++) {
                    columns.push(reader.row[i]?.trim());
                }

                if(!columns.includes("id")) {
                    throw new Error(`Does not include an "id" column`);
                }

                if(!columns.includes("level")) {
                    throw new Error(`Does not include a "level" column`);
                }

                if(!columns.includes("effectiveLevel")) {
                    throw new Error(`Does not include a "effectiveLevel" column`);
                }
            } else {
                let quality = {};
                for(let i = 0; i < reader.row.length; i++) {
                    quality[columns[i]] = reader.row[i];
                }
                result[quality.id] = quality;
                spoofCount++;
            }
        }

        this.spoof(result);
        return spoofCount;
    }
}