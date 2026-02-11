(function(){
    declareTests("ConditionParser");

    test(`parse() - Empty String - False Result`, async function(){
        const parser = new ConditionParser();
        assert(!parser.parse(""));
    });

    test(`parse() - "a" - Basic Existence Check`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a", {
            a: 1
        });
        assertEq(condition.type, LogicTypes.Comparison, "Type");
        assertEq(condition.quality, 1, "Quality");
        assertEq(condition.comparison, ComparisonTypes.Greater, "Comparison");
        assertEq(condition.value, 0, "Value");
        assert(!condition.property, "Property");
    });

    test(`parse() - "a=2" - Comparison Parsed`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a=2", {
            a: 1
        });
        assertEq(condition.type, LogicTypes.Comparison, "Type");
        assertEq(condition.quality, 1, "Quality");
        assertEq(condition.comparison, ComparisonTypes.Equal, "Comparison");
        assertEq(condition.value, 2, "Value");
        assert(!condition.property, "Property");
    });

    test(`parse() - "a!=2" - Comparison Parsed`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a!=2", {
            a: 1
        });
        assertEq(condition.type, LogicTypes.Comparison, "Type");
        assertEq(condition.quality, 1, "Quality");
        assertEq(condition.comparison, ComparisonTypes.NotEqual, "Comparison");
        assertEq(condition.value, 2, "Value");
        assert(!condition.property, "Property");
    });

    test(`parse() - "a>2" - Comparison Parsed`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a>2", {
            a: 1
        });
        assertEq(condition.type, LogicTypes.Comparison, "Type");
        assertEq(condition.quality, 1, "Quality");
        assertEq(condition.comparison, ComparisonTypes.Greater, "Comparison");
        assertEq(condition.value, 2, "Value");
        assert(!condition.property, "Property");
    });

    test(`parse() - "a>=2" - Comparison Parsed`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a>=2", {
            a: 1
        });
        assertEq(condition.type, LogicTypes.Comparison, "Type");
        assertEq(condition.quality, 1, "Quality");
        assertEq(condition.comparison, ComparisonTypes.GreaterEqual, "Comparison");
        assertEq(condition.value, 2, "Value");
        assert(!condition.property, "Property");
    });

    test(`parse() - "a<2" - Comparison Parsed`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a<2", {
            a: 1
        });
        assertEq(condition.type, LogicTypes.Comparison, "Type");
        assertEq(condition.quality, 1, "Quality");
        assertEq(condition.comparison, ComparisonTypes.Less, "Comparison");
        assertEq(condition.value, 2, "Value");
        assert(!condition.property, "Property");
    });

    test(`parse() - "a<=2" - Comparison Parsed`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a<=2", {
            a: 1
        });
        assertEq(condition.type, LogicTypes.Comparison, "Type");
        assertEq(condition.quality, 1, "Quality");
        assertEq(condition.comparison, ComparisonTypes.LessEqual, "Comparison");
        assertEq(condition.value, 2, "Value");
        assert(!condition.property, "Property");
    });

    test(`parse() - "a?2" - Error`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a?2", {
            a: 1
        });
        assertEq(condition.error, "Condition error at position 1: Unexpected element '?'");
    });

    test(`parse() - "a=b" - Error`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a=b", {
            a: 1
        });
        assertEq(condition.error, "Condition error at position 2: Comparision value 'b' is not number.");
    });

    test(`parse() - "(a)" - Same as Unbracketed`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("(a)", {
            a: 1
        });
        assertEq(condition.type, LogicTypes.Comparison, "Type");
        assertEq(condition.quality, 1, "Quality");
        assertEq(condition.comparison, ComparisonTypes.Greater, "Comparison");
        assertEq(condition.value, 0, "Value");
        assert(!condition.property, "Property");
    });

    test(`parse() - "(((a)))" - Same as Unbracketed`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("(((a)))", {
            a: 1
        });
        assertEq(condition.type, LogicTypes.Comparison, "Type");
        assertEq(condition.quality, 1, "Quality");
        assertEq(condition.comparison, ComparisonTypes.Greater, "Comparison");
        assertEq(condition.value, 0, "Value");
        assert(!condition.property, "Property");
    });

    test(`parse() - "(((a))" - Error`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("(((a))", {
            a: 1
        });
        assertEq(condition.error, "Condition error at position 0: Bracket not closed.");
    });

    test(`parse() - "((a)))" - Error`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("((a)))", {
            a: 1
        });
        assertEq(condition.error, "Condition error at position 5: Unexpected element ')'");
    });

    test(`parse() - "a&b" - Basic And`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a&b", {
            a: 1,
            b: 2
        });
        assertEq(condition.type, LogicTypes.And);
        assertEq(condition.left.type, LogicTypes.Comparison);
        assertEq(condition.left.quality, 1);
        assertEq(condition.left.comparison, ComparisonTypes.Greater);
        assertEq(condition.left.value, 0);
        assertEq(condition.right.type, LogicTypes.Comparison);
        assertEq(condition.right.quality, 2);
        assertEq(condition.right.comparison, ComparisonTypes.Greater);
        assertEq(condition.right.value, 0);
    });

    test(`parse() - "a&&b" - Basic And`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a&&b", {
            a: 1,
            b: 2
        });
        assertEq(condition.type, LogicTypes.And);
        assertEq(condition.left.type, LogicTypes.Comparison);
        assertEq(condition.left.quality, 1);
        assertEq(condition.left.comparison, ComparisonTypes.Greater);
        assertEq(condition.left.value, 0);
        assertEq(condition.right.type, LogicTypes.Comparison);
        assertEq(condition.right.quality, 2);
        assertEq(condition.right.comparison, ComparisonTypes.Greater);
        assertEq(condition.right.value, 0);
    });

    test(`parse() - "a&&&b" - error`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a&&&b", {
            a: 1,
            b: 2
        });
        assertEq(condition.error, "Condition error at position 1: Unexpected element '&&&'");
    });

    test(`parse() - "a|b" - Basic And`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a|b", {
            a: 1,
            b: 2
        });
        assertEq(condition.type, LogicTypes.Or);
        assertEq(condition.left.type, LogicTypes.Comparison);
        assertEq(condition.left.quality, 1);
        assertEq(condition.left.comparison, ComparisonTypes.Greater);
        assertEq(condition.left.value, 0);
        assertEq(condition.right.type, LogicTypes.Comparison);
        assertEq(condition.right.quality, 2);
        assertEq(condition.right.comparison, ComparisonTypes.Greater);
        assertEq(condition.right.value, 0);
    });

    test(`parse() - "a||b" - Basic And`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a||b", {
            a: 1,
            b: 2
        });
        assertEq(condition.type, LogicTypes.Or);
        assertEq(condition.left.type, LogicTypes.Comparison);
        assertEq(condition.left.quality, 1);
        assertEq(condition.left.comparison, ComparisonTypes.Greater);
        assertEq(condition.left.value, 0);
        assertEq(condition.right.type, LogicTypes.Comparison);
        assertEq(condition.right.quality, 2);
        assertEq(condition.right.comparison, ComparisonTypes.Greater);
        assertEq(condition.right.value, 0);
    });

    test(`parse() - "a|||b" - Error`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a|||b", {
            a: 1,
            b: 2
        });
        assertEq(condition.error, "Condition error at position 1: Unexpected element '|||'");
    });

    test(`parse() - "a.level" - Condition With Property`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a.level", {
            a: 1
        });
        assertEq(condition.type, LogicTypes.Comparison, "Type");
        assertEq(condition.quality, 1, "Quality");
        assertEq(condition.comparison, ComparisonTypes.Greater, "Comparison");
        assertEq(condition.value, 0, "Value");
        assertEq(condition.property, "level");
    });

    test(`parse() - "a.effectiveLevel" - Condition With Property`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a.effectiveLevel", {
            a: 1
        });
        assertEq(condition.type, LogicTypes.Comparison, "Type");
        assertEq(condition.quality, 1, "Quality");
        assertEq(condition.comparison, ComparisonTypes.Greater, "Comparison");
        assertEq(condition.value, 0, "Value");
        assertEq(condition.property, "effectiveLevel");
    });

    test(`parse() - "a.Level" - Error`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a.Level", {
            a: 1
        });
        assertEq(condition.error, "Condition error at position 2: Unknown quality property 'Level'");
    });

    test(`parse() - "a.2" - Condition With Property`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a.2", {
            a: 1
        });
        assertEq(condition.error, "Condition error at position 2: Invalid quality property '2'");
    });
    
    test(`parse() - "a.level == 2" - Condition With Property`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("a.level == 2", {
            a: 1
        });
        assertEq(condition.type, LogicTypes.Comparison, "Type");
        assertEq(condition.quality, 1, "Quality");
        assertEq(condition.comparison, ComparisonTypes.Equal, "Comparison");
        assertEq(condition.value, 2, "Value");
        assertEq(condition.property, "level");
    });

    test(`parse() - "!a" - Not`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("!a", {
            a: 1
        });

        assertEq(condition.type, LogicTypes.Not);
        assertEq(condition.statement.type, LogicTypes.Comparison);
        assertEq(condition.statement.quality, 1);
        assertEq(condition.statement.comparison, ComparisonTypes.Greater);
        assertEq(condition.statement.value, 0);
        assert(!condition.statement.property);
    });

    test(`parse() - "!a=2" - Not`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("!a=2", {
            a: 1
        });

        assertEq(condition.type, LogicTypes.Not);
        assertEq(condition.statement.type, LogicTypes.Comparison);
        assertEq(condition.statement.quality, 1);
        assertEq(condition.statement.comparison, ComparisonTypes.Equal);
        assertEq(condition.statement.value, 2);
        assert(!condition.statement.property);
    });

    test(`parse() - "!(a=2)" - Not`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("!(a=2)", {
            a: 1
        });

        assertEq(condition.type, LogicTypes.Not);
        assertEq(condition.statement.type, LogicTypes.Comparison);
        assertEq(condition.statement.quality, 1);
        assertEq(condition.statement.comparison, ComparisonTypes.Equal);
        assertEq(condition.statement.value, 2);
        assert(!condition.statement.property);
    });

    test(`parse() - "!" - Error`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("!", {
            a: 1
        });
        assertEq(condition.error, "Unexpected end of condition");
    });

    test(`parse() - "(!)" - Error`, async function(){
        const parser = new ConditionParser();
        const condition = parser.parse("(!)", {
            a: 1
        });
        assertEq(condition.error, "Condition error at position 2: No statement following a NOT.");
    });

    closeTests();
}());