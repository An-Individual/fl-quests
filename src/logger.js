export class Logger {
    static log(value) {
        console.log(`[FL Quests] ${value}`);
    }

    static debug(value) {
        console.log(`[FL Quests] ${value}`);
    }

    static error(error) {
        if(error.stack) {
            console.error(`[FL Quests] ${error.message}\n${error.stack}`);
        } else { 
            console.error(`[FL Quests] ${error}`);
        }
    }
}