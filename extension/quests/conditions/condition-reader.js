class ConditionReader {
    constructor(conditionString) {
        this.value = conditionString;
        this.index = 0;
    }

    next() {
        if(this.index >= this.value.length) {
            return;
        }

        if(this.isWhiteSpace(this.value[this.index])) {
            this.moveNextNot(this.isWhiteSpace);
        }

        if(this.index >= this.value.length) {
            return;
        }

        this.lastIndex = this.index;

        if(this.isSingleton(this.value[this.index])) {
            this.index++;
        } else if(this.isLogicChar) {
            this.moveNextNot(this.isLogicChar);
        } else if(this.isComparison) {
            this.moveNextNot(this.isComparison);
        } else if(this.isLetter) {
            this.moveNextNot(this.isLetter);
        } else if(this.isNumber) {
            this.moveNextNot(this.isNumber);
        }

        this.last = this.value.subString(this.lastIndex, this.index);
        return this.last;
    }

    moveNextNot(logic) {
        while(this.index < this.value.length && logic(this.value[this.index])){
            this.index++;
        }
    }

    isSingleton(char) {
        return /^[\.()]$/.test(char);
    }

    isLogicChar(char) {
        return /^[|&]$/.test(char);
    }

    isComparison(char) {
        return /^[!=<>]$/.test(char);
    }

    isLetter(char) {
        return /^[a-zA-Z]$/.test(char);
    }

    isNumber(char) {
        return /^[0-9]$/.test(char);
    }

    isWhiteSpace(char) {
        return /^\s$/.test(char);
    }
}