class QualityTracker {
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
        return this.qualities[id];
    }

    getAll()
    {
        let result = [];
        for(const id in this.qualities) {
            result.push(this.qualities[id]);
        }
        return result;
    }

    getValue(id, property) {
        if(!property) {
            property = "level"
        }
        return this.qualities[id]?.[property] ?? 0;
    }

    spoof(fakeQualities) {
        this.spoofed = true;
        this.qualities = fakeQualities;
    }

    onMyself(response) {
        if(this.spoofed){
            return;
        }

        let newQualities = {};
        response.possessions.forEach((category) => {
            category.possessions.forEach((quality) =>{
                newQualities[quality.id] = quality;
            });
        });

        this.qualities = newQualities;
    }

    onBranch(response) {
        if(this.spoofed){
            return;
        }

        if (response.messages?.length > 0){
            response.messages.forEach((message) =>{
                if (message.possession){
                    this.qualities[message.possession.id] = message.possession;
                }
            });
        }
    }

    exportToCSV()
    {
        let qualities = this.getAll();
        const builder = new CSVBuilder();
        
        builder.addRow([
            "ID",
            "Level",
            "Effective Level",
            "Name",
            "Category",
            "Nature"
        ]);

        qualities.forEach(quality => {
            builder.addRow([
                quality.id,
                quality.level,
                quality.effectiveLevel,
                quality.name,
                quality.category,
                quality.nature
            ]);
        });

        return builder.result;
    }
}