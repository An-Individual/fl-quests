class CSVReader {
    constructor(csvString) {
        this.remaining = csvString;
    }

    readRow() {
        if(!this.remaining) {
            this.row = undefined;
            return;
        }

        let cells = [];
        while(this.remaining) {
            // Overly defensive, but we're just going to allow
            // any combination and number of return and new line
            // characters to end a line rather than strictly
            // requiring one row per line. The goal is to reliably
            // parse a CSV exported from various spreadsheet
            // programs, not be pedantic about CSV formatting.
            let endline = this.remaining.match(/^[\r\n]+/);
            if(endline) {
                this.remaining = this.remaining.slice(endline[0].length);
                break;
            }

            let quoteCell = this.remaining.match(/^"(([^"]|"{2})*)",?/);
            if(quoteCell) {
                cells.push(quoteCell[1].replace(`""`,`"`));
                this.remaining = this.remaining.slice(quoteCell[0].length);
            } else {
                // This will match even on an empty string
                let plainCell = this.remaining.match(/^([^,\r\n]*),?/);
                cells.push(plainCell[1]);
                this.remaining = this.remaining.slice(plainCell[0].length);
            }
        }

        if(this.row && this.row.length != cells.length) {
            throw new Error("CSV Parsing Error: Row length is not consistent.")
        }

        this.row = cells;
        return cells;
    }
}