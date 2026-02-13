import { QuestsManager } from "../../src/quests/quests-manager.js";
import { QuestStates, LogicTypes, ComparisonTypes } from "../../src/quests/quests-datatypes.js";
import assert from "node:assert";

describe("QuestsManager", function(){
    function makeSpoofedManager() {
        const manager = new QuestsManager();
        manager.qualities = {
            getValue: function(key) {
                return manager.qualities[key];
            }
        }
        manager.categories = [];
        manager.getCategories = function() {
            return manager.categories;
        }

        return manager;
    }

    function getValidComparison() {
        return {
            type: LogicTypes.Comparison,
            comparison: ComparisonTypes.Equal,
            quality: 1,
            value: 123
        };
    }

    function getInvalidComparison() {
        return {
            type: LogicTypes.Comparison,
            quality: 1,
            value: 123
        };
    }

    describe("#evaluateComparison()", function(){
        let manager;
        this.beforeEach(function(){
            manager = makeSpoofedManager();
        });

        it("Equal True - Returns True", function() {
            manager.qualities[1] = 123;
            const condition = {
                comparison: ComparisonTypes.Equal,
                quality: 1,
                value: 123
            };
            assert.equal(manager.evaluateComparison(condition), true);
        });

        it("Equal False - Returns False", function() {
            manager.qualities[1] = 123;
            const condition = {
                comparison: ComparisonTypes.Equal,
                quality: 1,
                value: 321
            };
            assert.equal(manager.evaluateComparison(condition), false);
        });

        it("NotEqual True - Returns True", function() {
            manager.qualities[1] = 123;
            const condition = {
                comparison: ComparisonTypes.NotEqual,
                quality: 1,
                value: 321
            };
            assert.equal(manager.evaluateComparison(condition), true);
        });

        it("NotEqual False - Returns False", function() {
            manager.qualities[1] = 123;
            const condition = {
                comparison: ComparisonTypes.NotEqual,
                quality: 1,
                value: 123
            };
            assert.equal(manager.evaluateComparison(condition), false);
        });

        it("Greater True - Returns True", function() {
            manager.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Greater,
                quality: 1,
                value: 7
            };
            assert.equal(manager.evaluateComparison(condition), true);
        });

        it("Greater False - Returns False", function() {
            manager.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Greater,
                quality: 1,
                value: 10
            };
            assert.equal(manager.evaluateComparison(condition), false);
        });

        it("GreaterEqual True - Returns True", function() {
            manager.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.GreaterEqual,
                quality: 1,
                value: 10
            };
            assert.equal(manager.evaluateComparison(condition), true);
        });

        it("GreaterEqual False - Returns False", function() {
            manager.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.GreaterEqual,
                quality: 1,
                value: 11
            };
            assert.equal(manager.evaluateComparison(condition), false);
        });
        
        it("Less True - Returns True", function() {
            manager.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Less,
                quality: 1,
                value: 77
            };
            assert.equal(manager.evaluateComparison(condition), true);
        });

        it("Less False - Returns False", function() {
            manager.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Less,
                quality: 1,
                value: 10
            };
            assert.equal(manager.evaluateComparison(condition), false);
        });

        it("Less True - Returns True", function() {
            manager.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Less,
                quality: 1,
                value: 77
            };
            assert.equal(manager.evaluateComparison(condition), true);
        });

        it("Less False - Returns False", function() {
            manager.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Less,
                quality: 1,
                value: 10
            };
            assert.equal(manager.evaluateComparison(condition), false);
        });

        it("LessEqual True - Returns True", function() {
            manager.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.LessEqual,
                quality: 1,
                value: 10
            };
            assert.equal(manager.evaluateComparison(condition), true);
        });

        it("LessEqual False - Returns False", function() {
            manager.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.LessEqual,
                quality: 1,
                value: 0
            };
            assert.equal(manager.evaluateComparison(condition), false);
        });

        it("No Quality - Error", function() {
            manager.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.LessEqual,
                value: 1
            };
            assert.throws(function(){
                manager.evaluateComparison(condition);
            }, e => e.message == `Quality comparision does not specify a quality.`);
        });

        it("No Value - Error", function() {
            manager.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.LessEqual,
                quality: 1
            };
            assert.throws(function(){
                manager.evaluateComparison(condition);
            }, e => e.message == `Quality comparision does not specify a value.`);
        });

        it("Invalid Comparison - Error", function() {
            manager.qualities[1] = 10;
            const condition = {
                comparison: 7,
                quality: 1,
                value: 1
            };
            assert.throws(function(){
                manager.evaluateComparison(condition);
            }, e => e.message == `Unknown comparison type: 7`);
        });

        it("Undefined Comparison - Error", function() {
            assert.throws(function(){
                manager.evaluateComparison();
            }, e => e.message == `Comparison Undefined`);
        });
    });

    describe("#evaluateCondition()", function(){
        let manager;
        this.beforeEach(function(){
            manager = makeSpoofedManager();
        });

        it("AND both True - True", function() {
            manager.qualities[1] = 10;
            let condition = {
                type: LogicTypes.And,
                left: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 10
                },
                right: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 10
                }
            }
            assert.equal(manager.evaluateCondition(condition), true);
        });

        it("AND left False - False", function() {
            manager.qualities[1] = 10;
            let condition = {
                type: LogicTypes.And,
                left: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 1
                },
                right: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 10
                }
            }
            assert.equal(manager.evaluateCondition(condition), false);
        });

        it("AND right False - False", function() {
            manager.qualities[1] = 10;
            let condition = {
                type: LogicTypes.And,
                left: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 10
                },
                right: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 1
                }
            }
            assert.equal(manager.evaluateCondition(condition), false);
        });

        it("AND both False - False", function() {
            manager.qualities[1] = 10;
            let condition = {
                type: LogicTypes.And,
                left: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 1
                },
                right: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 1
                }
            }
            assert.equal(manager.evaluateCondition(condition), false);
        });

        it("OR both True - True", function() {
            manager.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Or,
                left: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 10
                },
                right: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 10
                }
            }
            assert.equal(manager.evaluateCondition(condition), true);
        });

        it("OR left False - True", function() {
            manager.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Or,
                left: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 1
                },
                right: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 10
                }
            }
            assert.equal(manager.evaluateCondition(condition), true);
        });

        it("OR right False - True", function() {
            manager.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Or,
                left: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 10
                },
                right: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 1
                }
            }
            assert.equal(manager.evaluateCondition(condition), true);
        });

        it("OR both False - False", function() {
            manager.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Or,
                left: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 1
                },
                right: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 1
                }
            }
            assert.equal(manager.evaluateCondition(condition), false);
        });

        it("NOT on True - False", function(){
            manager.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Not,
                statement: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 10
                }
            }
            assert.equal(manager.evaluateCondition(condition), false);
        });

        it("NOT on False - True", function(){
            manager.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Not,
                statement: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 1
                }
            }
            assert.equal(manager.evaluateCondition(condition), true);
        });

        it("True Condition - True", function(){
            manager.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Comparison,
                quality: 1,
                comparison: ComparisonTypes.Equal,
                value: 10
            }
            assert.equal(manager.evaluateCondition(condition), true);
        });

        it("False Condition - False", function(){
            manager.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Comparison,
                quality: 1,
                comparison: ComparisonTypes.Equal,
                value: 1
            }
            assert.equal(manager.evaluateCondition(condition), false);
        });

        it("AND no Left - Error", function(){
            let condition = {
                type: LogicTypes.And,
                right: getValidComparison()
            }
            assert.throws(function(){
                manager.evaluateCondition(condition);
            }, e => e.message == `AND left condition undefined.`)
        });

        it("AND no Right - Error", function(){
            let condition = {
                type: LogicTypes.And,
                left: getValidComparison()
            }
            assert.throws(function(){
                manager.evaluateCondition(condition);
            }, e => e.message == `AND right condition undefined.`)
        });

        it("OR no Left - Error", function(){
            let condition = {
                type: LogicTypes.Or,
                right: getValidComparison()
            }
            assert.throws(function(){
                manager.evaluateCondition(condition);
            }, e => e.message == `OR left condition undefined.`)
        });

        it("OR no Right - Error", function(){
            let condition = {
                type: LogicTypes.Or,
                left: getValidComparison()
            }
            assert.throws(function(){
                manager.evaluateCondition(condition);
            }, e => e.message == `OR right condition undefined.`)
        });

        it("NOT no Statement - Error", function(){
            let condition = {
                type: LogicTypes.Not
            }
            assert.throws(function(){
                manager.evaluateCondition(condition);
            }, e => e.message == `NOT statement undefined.`)
        });

        it("No type - Error", function(){
            let condition = {
            }
            assert.throws(function(){
                manager.evaluateCondition(condition);
            }, e => e.message == `Unknown condition type: undefined`)
        });

        it("Invalid type - Error", function(){
            let condition = {
                type: 5
            }
            assert.throws(function(){
                manager.evaluateCondition(condition);
            }, e => e.message == `Unknown condition type: 5`)
        });

        it("No Parameters - Error", function(){
            assert.throws(function(){
                manager.evaluateCondition();
            }, e => e.message == `Condition Undefined`)
        });
    });
});