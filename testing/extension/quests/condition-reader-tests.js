(function(){
    declareTests("ConditionReader");

    test("next() - Empty String - False", async function(){
        const reader = new ConditionReader("");
        assert(!reader.next());
    });

    test("next() - Whitespace String - False", async function(){
        const reader = new ConditionReader(" \r\n ");
        assert(!reader.next());
    });

    closeTests();
}())