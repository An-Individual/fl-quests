import { ConditionParser } from "../../src/quests/conditions/condition-parser.js";
import { LogicTypes, ComparisonTypes } from "../../src/quests/quests-datatypes.js";
import assert from "node:assert";

describe("ConditionParser", function(){
    describe("parse()", function(){
        let parser;
        beforeEach(function() {
            parser = new ConditionParser();
        });
        
        it(`Empty String - False Result`, function(){
            assert(!parser.parse(""));
        });

        it(`"a" - Basic Existence Check`, function(){
            const condition = parser.parse("a", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison, "Type");
            assert.equal(condition.quality, 1, "Quality");
            assert.equal(condition.comparison, ComparisonTypes.Greater, "Comparison");
            assert.equal(condition.value, 0, "Value");
            assert(!condition.property, "Property");
        });

        it(`"a=2" - Comparison Parsed`, function(){
            const condition = parser.parse("a=2", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison, "Type");
            assert.equal(condition.quality, 1, "Quality");
            assert.equal(condition.comparison, ComparisonTypes.Equal, "Comparison");
            assert.equal(condition.value, 2, "Value");
            assert(!condition.property, "Property");
        });

        it(`"a!=2" - Comparison Parsed`, function(){
            const condition = parser.parse("a!=2", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison, "Type");
            assert.equal(condition.quality, 1, "Quality");
            assert.equal(condition.comparison, ComparisonTypes.NotEqual, "Comparison");
            assert.equal(condition.value, 2, "Value");
            assert(!condition.property, "Property");
        });

        it(`"a>2" - Comparison Parsed`, function(){
            const condition = parser.parse("a>2", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison, "Type");
            assert.equal(condition.quality, 1, "Quality");
            assert.equal(condition.comparison, ComparisonTypes.Greater, "Comparison");
            assert.equal(condition.value, 2, "Value");
            assert(!condition.property, "Property");
        });

        it(`"a>=2" - Comparison Parsed`, function(){
            const condition = parser.parse("a>=2", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison, "Type");
            assert.equal(condition.quality, 1, "Quality");
            assert.equal(condition.comparison, ComparisonTypes.GreaterEqual, "Comparison");
            assert.equal(condition.value, 2, "Value");
            assert(!condition.property, "Property");
        });

        it(`"a<2" - Comparison Parsed`, function(){
            const condition = parser.parse("a<2", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison, "Type");
            assert.equal(condition.quality, 1, "Quality");
            assert.equal(condition.comparison, ComparisonTypes.Less, "Comparison");
            assert.equal(condition.value, 2, "Value");
            assert(!condition.property, "Property");
        });

        it(`"a<=2" - Comparison Parsed`, function(){
            const condition = parser.parse("a<=2", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison, "Type");
            assert.equal(condition.quality, 1, "Quality");
            assert.equal(condition.comparison, ComparisonTypes.LessEqual, "Comparison");
            assert.equal(condition.value, 2, "Value");
            assert(!condition.property, "Property");
        });

        it(`"a?2" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("a?2", {
                    a: 1
                });
            }, Error, "Condition error at position 1: Unexpected element '?'");
        });

        it(`"a?2" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("a?2", {
                    a: 1
                });
            }, Error, "Condition error at position 1: Unexpected element '?'");
        });

        it(`"a=b" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("a=b", {
                    a: 1
                });
            }, Error, "Condition error at position 2: Comparision value 'b' is not number.");
        });

        it(`"(a)" - Same as Unbracketed`, function(){
            const condition = parser.parse("(a)", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison, "Type");
            assert.equal(condition.quality, 1, "Quality");
            assert.equal(condition.comparison, ComparisonTypes.Greater, "Comparison");
            assert.equal(condition.value, 0, "Value");
            assert(!condition.property, "Property");
        });

        it(`"(((a)))" - Same as Unbracketed`, function(){
            const condition = parser.parse("(((a)))", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison, "Type");
            assert.equal(condition.quality, 1, "Quality");
            assert.equal(condition.comparison, ComparisonTypes.Greater, "Comparison");
            assert.equal(condition.value, 0, "Value");
            assert(!condition.property, "Property");
        });

        it(`"(((a))" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("(((a))", {
                    a: 1
                });
            }, Error, "Condition error at position 0: Bracket not closed.");
        });

        it(`"((a)))" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("((a)))", {
                    a: 1
                });
            }, Error, "Condition error at position 5: Unexpected element ')'");
        });

        it(`"a&b" - Basic And`, function(){
            const condition = parser.parse("a&b", {
                a: 1,
                b: 2
            });
            assert.equal(condition.type, LogicTypes.And);
            assert.equal(condition.left.type, LogicTypes.Comparison);
            assert.equal(condition.left.quality, 1);
            assert.equal(condition.left.comparison, ComparisonTypes.Greater);
            assert.equal(condition.left.value, 0);
            assert.equal(condition.right.type, LogicTypes.Comparison);
            assert.equal(condition.right.quality, 2);
            assert.equal(condition.right.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.value, 0);
        });

        it(`"a&&b" - Basic And`, function(){
            const condition = parser.parse("a&&b", {
                a: 1,
                b: 2
            });
            assert.equal(condition.type, LogicTypes.And);
            assert.equal(condition.left.type, LogicTypes.Comparison);
            assert.equal(condition.left.quality, 1);
            assert.equal(condition.left.comparison, ComparisonTypes.Greater);
            assert.equal(condition.left.value, 0);
            assert.equal(condition.right.type, LogicTypes.Comparison);
            assert.equal(condition.right.quality, 2);
            assert.equal(condition.right.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.value, 0);
        });

        it(`"a&&&b" - error`, function(){
            assert.throws(function(){
                const condition = parser.parse("a&&&b", {
                    a: 1,
                    b: 2
                });
            }, Error, "Condition error at position 1: Unexpected element '&&&'");
        });

        it(`"a|b" - Basic And`, function(){
            const condition = parser.parse("a|b", {
                a: 1,
                b: 2
            });
            assert.equal(condition.type, LogicTypes.Or);
            assert.equal(condition.left.type, LogicTypes.Comparison);
            assert.equal(condition.left.quality, 1);
            assert.equal(condition.left.comparison, ComparisonTypes.Greater);
            assert.equal(condition.left.value, 0);
            assert.equal(condition.right.type, LogicTypes.Comparison);
            assert.equal(condition.right.quality, 2);
            assert.equal(condition.right.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.value, 0);
        });

        it(`"a||b" - Basic And`, function(){
            const condition = parser.parse("a||b", {
                a: 1,
                b: 2
            });
            assert.equal(condition.type, LogicTypes.Or);
            assert.equal(condition.left.type, LogicTypes.Comparison);
            assert.equal(condition.left.quality, 1);
            assert.equal(condition.left.comparison, ComparisonTypes.Greater);
            assert.equal(condition.left.value, 0);
            assert.equal(condition.right.type, LogicTypes.Comparison);
            assert.equal(condition.right.quality, 2);
            assert.equal(condition.right.comparison, ComparisonTypes.Greater);
            assert.equal(condition.right.value, 0);
        });

        it(`"a|||b" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("a|||b", {
                    a: 1,
                    b: 2
                });
            }, Error, "Condition error at position 1: Unexpected element '|||'");
        });

        it(`"a.level" - Condition With Property`, function(){
            const condition = parser.parse("a.level", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison, "Type");
            assert.equal(condition.quality, 1, "Quality");
            assert.equal(condition.comparison, ComparisonTypes.Greater, "Comparison");
            assert.equal(condition.value, 0, "Value");
            assert.equal(condition.property, "level");
        });

        it(`"a.effectiveLevel" - Condition With Property`, function(){
            const condition = parser.parse("a.effectiveLevel", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison, "Type");
            assert.equal(condition.quality, 1, "Quality");
            assert.equal(condition.comparison, ComparisonTypes.Greater, "Comparison");
            assert.equal(condition.value, 0, "Value");
            assert.equal(condition.property, "effectiveLevel");
        });

        it(`"a.Level" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("a.Level", {
                    a: 1
                });
            }, Error, "Condition error at position 2: Unknown quality property 'Level'");
        });

        it(`"a.2" - Condition With Property`, function(){
            assert.throws(function(){
                const condition = parser.parse("a.2", {
                    a: 1
                });
            }, Error, "Condition error at position 2: Invalid quality property '2'");
        });

        it(`"a.level == 2" - Condition With Property`, function(){
            const condition = parser.parse("a.level == 2", {
                a: 1
            });
            assert.equal(condition.type, LogicTypes.Comparison, "Type");
            assert.equal(condition.quality, 1, "Quality");
            assert.equal(condition.comparison, ComparisonTypes.Equal, "Comparison");
            assert.equal(condition.value, 2, "Value");
            assert.equal(condition.property, "level");
        });

        it(`"!a" - Not`, function(){
            const condition = parser.parse("!a", {
                a: 1
            });

            assert.equal(condition.type, LogicTypes.Not);
            assert.equal(condition.statement.type, LogicTypes.Comparison);
            assert.equal(condition.statement.quality, 1);
            assert.equal(condition.statement.comparison, ComparisonTypes.Greater);
            assert.equal(condition.statement.value, 0);
            assert(!condition.statement.property);
        });

        it(`"!a=2" - Not`, function(){
            const condition = parser.parse("!a=2", {
                a: 1
            });

            assert.equal(condition.type, LogicTypes.Not);
            assert.equal(condition.statement.type, LogicTypes.Comparison);
            assert.equal(condition.statement.quality, 1);
            assert.equal(condition.statement.comparison, ComparisonTypes.Equal);
            assert.equal(condition.statement.value, 2);
            assert(!condition.statement.property);
        });

        it(`"!(a=2)" - Not`, function(){
            const condition = parser.parse("!(a=2)", {
                a: 1
            });

            assert.equal(condition.type, LogicTypes.Not);
            assert.equal(condition.statement.type, LogicTypes.Comparison);
            assert.equal(condition.statement.quality, 1);
            assert.equal(condition.statement.comparison, ComparisonTypes.Equal);
            assert.equal(condition.statement.value, 2);
            assert(!condition.statement.property);
        });

        it(`"!" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("!", {
                    a: 1
                });
            }, Error, "Unexpected end of condition");
        });

        it(`"(!)" - Error`, function(){
            assert.throws(function(){
                const condition = parser.parse("(!)", {
                    a: 1
                });
            }, Error, "Condition error at position 2: No statement following a NOT.");
        });
    });
});