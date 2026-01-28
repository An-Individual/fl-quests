class QualityManager {
    constructor() {
        this.qualities = {};
        this.spoofed = false;
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
}

const Qualities = new QualityManager();