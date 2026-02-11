export class CSVBuilder {
    constructor() {
        this.result = "";
    }

    addCell(value){
        if(this.result.slice(-1) == "\""){
            this.result += ",";
        }

        if(!value){
            this.result += `""`;
        }
        else{
            if(value.replace){
                value = value.replace("\"", "\"\"");
            }
            this.result += `"${value}"`;
        }
    }

    addRow(values) {
        if(this.result.slice(-1) == "\""){
            this.result += "\n";
        }
        if(values){
            values.forEach((val) => {
                this.addCell(val);
            });
        }
    }
}