import { QuestsRenderer } from "../../src/quests/quests-renderer.js";
import { QuestStates, LogicTypes, ComparisonTypes } from "../../src/quests/quests-datatypes.js";
import assert from "node:assert";

describe("QuestsRenderer", function(){
    function makeSpoofedRenderer() {
        const renderer = new QuestsRenderer();
        renderer.qualities = {
            getValue: function(key) {
                return renderer.qualities[key];
            }
        }
        return renderer;
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
        let renderer;
        this.beforeEach(function(){
            renderer = makeSpoofedRenderer();
        });

        it("Equal True - Returns True", function() {
            renderer.qualities[1] = 123;
            const condition = {
                comparison: ComparisonTypes.Equal,
                quality: 1,
                value: 123
            };
            assert.equal(renderer.evaluateComparison(condition), true);
        });

        it("Equal False - Returns False", function() {
            renderer.qualities[1] = 123;
            const condition = {
                comparison: ComparisonTypes.Equal,
                quality: 1,
                value: 321
            };
            assert.equal(renderer.evaluateComparison(condition), false);
        });

        it("NotEqual True - Returns True", function() {
            renderer.qualities[1] = 123;
            const condition = {
                comparison: ComparisonTypes.NotEqual,
                quality: 1,
                value: 321
            };
            assert.equal(renderer.evaluateComparison(condition), true);
        });

        it("NotEqual False - Returns False", function() {
            renderer.qualities[1] = 123;
            const condition = {
                comparison: ComparisonTypes.NotEqual,
                quality: 1,
                value: 123
            };
            assert.equal(renderer.evaluateComparison(condition), false);
        });

        it("Greater True - Returns True", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Greater,
                quality: 1,
                value: 7
            };
            assert.equal(renderer.evaluateComparison(condition), true);
        });

        it("Greater False - Returns False", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Greater,
                quality: 1,
                value: 10
            };
            assert.equal(renderer.evaluateComparison(condition), false);
        });

        it("GreaterEqual True - Returns True", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.GreaterEqual,
                quality: 1,
                value: 10
            };
            assert.equal(renderer.evaluateComparison(condition), true);
        });

        it("GreaterEqual False - Returns False", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.GreaterEqual,
                quality: 1,
                value: 11
            };
            assert.equal(renderer.evaluateComparison(condition), false);
        });
        
        it("Less True - Returns True", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Less,
                quality: 1,
                value: 77
            };
            assert.equal(renderer.evaluateComparison(condition), true);
        });

        it("Less False - Returns False", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Less,
                quality: 1,
                value: 10
            };
            assert.equal(renderer.evaluateComparison(condition), false);
        });

        it("Less True - Returns True", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Less,
                quality: 1,
                value: 77
            };
            assert.equal(renderer.evaluateComparison(condition), true);
        });

        it("Less False - Returns False", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.Less,
                quality: 1,
                value: 10
            };
            assert.equal(renderer.evaluateComparison(condition), false);
        });

        it("LessEqual True - Returns True", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.LessEqual,
                quality: 1,
                value: 10
            };
            assert.equal(renderer.evaluateComparison(condition), true);
        });

        it("LessEqual False - Returns False", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.LessEqual,
                quality: 1,
                value: 0
            };
            assert.equal(renderer.evaluateComparison(condition), false);
        });

        it("No Quality - Error", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.LessEqual,
                value: 1
            };
            assert.throws(function(){
                renderer.evaluateComparison(condition);
            }, e => e.message == `Quality comparision does not specify a quality.`);
        });

        it("No Value - Error", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: ComparisonTypes.LessEqual,
                quality: 1
            };
            assert.throws(function(){
                renderer.evaluateComparison(condition);
            }, e => e.message == `Quality comparision does not specify a value.`);
        });

        it("Invalid Comparison - Error", function() {
            renderer.qualities[1] = 10;
            const condition = {
                comparison: 7,
                quality: 1,
                value: 1
            };
            assert.throws(function(){
                renderer.evaluateComparison(condition);
            }, e => e.message == `Unknown comparison type: 7`);
        });

        it("Undefined Comparison - Error", function() {
            assert.throws(function(){
                renderer.evaluateComparison();
            }, e => e.message == `Comparison Undefined`);
        });
    });

    describe("#evaluateCondition()", function(){
        let renderer;
        this.beforeEach(function(){
            renderer = makeSpoofedRenderer();
        });

        it("AND both True - True", function() {
            renderer.qualities[1] = 10;
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
            assert.equal(renderer.evaluateCondition(condition), true);
        });

        it("AND left False - False", function() {
            renderer.qualities[1] = 10;
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
            assert.equal(renderer.evaluateCondition(condition), false);
        });

        it("AND right False - False", function() {
            renderer.qualities[1] = 10;
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
            assert.equal(renderer.evaluateCondition(condition), false);
        });

        it("AND both False - False", function() {
            renderer.qualities[1] = 10;
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
            assert.equal(renderer.evaluateCondition(condition), false);
        });

        it("OR both True - True", function() {
            renderer.qualities[1] = 10;
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
            assert.equal(renderer.evaluateCondition(condition), true);
        });

        it("OR left False - True", function() {
            renderer.qualities[1] = 10;
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
            assert.equal(renderer.evaluateCondition(condition), true);
        });

        it("OR right False - True", function() {
            renderer.qualities[1] = 10;
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
            assert.equal(renderer.evaluateCondition(condition), true);
        });

        it("OR both False - False", function() {
            renderer.qualities[1] = 10;
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
            assert.equal(renderer.evaluateCondition(condition), false);
        });

        it("NOT on True - False", function(){
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Not,
                statement: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 10
                }
            }
            assert.equal(renderer.evaluateCondition(condition), false);
        });

        it("NOT on False - True", function(){
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Not,
                statement: {
                    type: LogicTypes.Comparison,
                    quality: 1,
                    comparison: ComparisonTypes.Equal,
                    value: 1
                }
            }
            assert.equal(renderer.evaluateCondition(condition), true);
        });

        it("True Condition - True", function(){
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Comparison,
                quality: 1,
                comparison: ComparisonTypes.Equal,
                value: 10
            }
            assert.equal(renderer.evaluateCondition(condition), true);
        });

        it("False Condition - False", function(){
            renderer.qualities[1] = 10;
            let condition = {
                type: LogicTypes.Comparison,
                quality: 1,
                comparison: ComparisonTypes.Equal,
                value: 1
            }
            assert.equal(renderer.evaluateCondition(condition), false);
        });

        it("AND no Left - Error", function(){
            let condition = {
                type: LogicTypes.And,
                right: getValidComparison()
            }
            assert.throws(function(){
                renderer.evaluateCondition(condition);
            }, e => e.message == `AND left condition undefined.`)
        });

        it("AND no Right - Error", function(){
            let condition = {
                type: LogicTypes.And,
                left: getValidComparison()
            }
            assert.throws(function(){
                renderer.evaluateCondition(condition);
            }, e => e.message == `AND right condition undefined.`)
        });

        it("OR no Left - Error", function(){
            let condition = {
                type: LogicTypes.Or,
                right: getValidComparison()
            }
            assert.throws(function(){
                renderer.evaluateCondition(condition);
            }, e => e.message == `OR left condition undefined.`)
        });

        it("OR no Right - Error", function(){
            let condition = {
                type: LogicTypes.Or,
                left: getValidComparison()
            }
            assert.throws(function(){
                renderer.evaluateCondition(condition);
            }, e => e.message == `OR right condition undefined.`)
        });

        it("NOT no Statement - Error", function(){
            let condition = {
                type: LogicTypes.Not
            }
            assert.throws(function(){
                renderer.evaluateCondition(condition);
            }, e => e.message == `NOT statement undefined.`)
        });

        it("No type - Error", function(){
            let condition = {
            }
            assert.throws(function(){
                renderer.evaluateCondition(condition);
            }, e => e.message == `Unknown condition type: undefined`)
        });

        it("Invalid type - Error", function(){
            let condition = {
                type: 5
            }
            assert.throws(function(){
                renderer.evaluateCondition(condition);
            }, e => e.message == `Unknown condition type: 5`)
        });

        it("No Parameters - Error", function(){
            assert.throws(function(){
                renderer.evaluateCondition();
            }, e => e.message == `Condition Undefined`)
        });
    });

    describe("#renderQuest()", function(){
        let renderer;
        this.beforeEach(function(){
            renderer = makeSpoofedRenderer();
        });

        it("No Parameters - Falsy Response", function(){
            assert(!renderer.renderQuest());
        });

        it("No States Property - Falsy Response", function(){
            const quest = {
                title: "Quest Title"
            };
            assert(!renderer.renderQuest(quest));
        });

        it("Empty States Array - Falsy Response", function(){
            const quest = {
                title: "Quest Title",
                states: []
            };
            assert(!renderer.renderQuest(quest));
        });

        it("Matching State - Simple Result", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                order: 10,
                states: [
                    {
                        state: QuestStates.Completed,
                        description: "State Description",
                        condition: {
                            type: LogicTypes.Comparison,
                            quality: 1,
                            comparison: ComparisonTypes.Equal,
                            value: 10
                        }
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, "Quest Title");
            assert.equal(result.order, 10);
            assert.equal(result.state, QuestStates.Completed);
            assert.equal(result.details, "State Description");
            assert.equal(result.subtasks.length, 0);
        });

        it("No Title - Undefined Title", function(){
            renderer.qualities[1] = 10;
            const quest = {
                order: 10,
                states: [
                    {
                        state: QuestStates.Completed,
                        description: "State Description",
                        condition: {
                            type: LogicTypes.Comparison,
                            quality: 1,
                            comparison: ComparisonTypes.Equal,
                            value: 10
                        }
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, undefined);
            assert.equal(result.order, 10);
            assert.equal(result.state, QuestStates.Completed);
            assert.equal(result.details, "State Description");
            assert.equal(result.subtasks.length, 0);
        });

        it("No Order - Zero Order", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                states: [
                    {
                        state: QuestStates.Completed,
                        description: "State Description",
                        condition: {
                            type: LogicTypes.Comparison,
                            quality: 1,
                            comparison: ComparisonTypes.Equal,
                            value: 10
                        }
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, "Quest Title");
            assert.equal(result.order, 0);
            assert.equal(result.state, QuestStates.Completed);
            assert.equal(result.details, "State Description");
            assert.equal(result.subtasks.length, 0);
        });

        it("No Matching State - Falsy Result", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                states: [
                    {
                        state: QuestStates.Completed,
                        description: "State Description",
                        condition: {
                            type: LogicTypes.Comparison,
                            quality: 1,
                            comparison: ComparisonTypes.Equal,
                            value: 1
                        }
                    }
                ]
            };
            assert(!renderer.renderQuest(quest));
        });

        it("Multiple Matching States - Last One Selected", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                states: [
                    {
                        state: QuestStates.InProgress,
                        description: "State 1",
                        condition: {
                            type: LogicTypes.Comparison,
                            quality: 1,
                            comparison: ComparisonTypes.Equal,
                            value: 10
                        }
                    },
                    {
                        state: QuestStates.Completed,
                        description: "State 2",
                        condition: {
                            type: LogicTypes.Comparison,
                            quality: 1,
                            comparison: ComparisonTypes.Equal,
                            value: 10
                        }
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, "Quest Title");
            assert.equal(result.state, QuestStates.Completed);
            assert.equal(result.details, "State 2");
            assert.equal(result.subtasks.length, 0);
        });

        it("Task Without Completed - Error", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                states: [
                    {
                        state: QuestStates.InProgress,
                        description: "State 1",
                        condition: {
                            type: LogicTypes.Comparison,
                            quality: 1,
                            comparison: ComparisonTypes.Equal,
                            value: 10
                        },
                        tasks: [
                            {
                                description: "Task 1"
                            }
                        ]
                    }
                ]
            };
            assert.throws(function(){
                renderer.renderQuest(quest);
            }, e => e.message == "Task does not include a completed condition.");
        });

        it("Incomplete Task - Error", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                states: [
                    {
                        state: QuestStates.InProgress,
                        description: "State 1",
                        condition: {
                            type: LogicTypes.Comparison,
                            quality: 1,
                            comparison: ComparisonTypes.Equal,
                            value: 10
                        },
                        tasks: [
                            {
                                description: "Task 1",
                                completed: {
                                    type: LogicTypes.Comparison,
                                    quality: 1,
                                    comparison: ComparisonTypes.Equal,
                                    value: 1
                                }
                            }
                        ]
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, "Quest Title");
            assert.equal(result.state, QuestStates.InProgress);
            assert.equal(result.details, "State 1");
            assert.equal(result.subtasks.length, 1);
            assert.equal(result.subtasks[0].description, "Task 1")
            assert.equal(result.subtasks[0].completed, false);
        });

        it("Completed Task - Error", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                states: [
                    {
                        state: QuestStates.InProgress,
                        description: "State 1",
                        condition: {
                            type: LogicTypes.Comparison,
                            quality: 1,
                            comparison: ComparisonTypes.Equal,
                            value: 10
                        },
                        tasks: [
                            {
                                description: "Task 1",
                                completed: {
                                    type: LogicTypes.Comparison,
                                    quality: 1,
                                    comparison: ComparisonTypes.Equal,
                                    value: 10
                                }
                            }
                        ]
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, "Quest Title");
            assert.equal(result.state, QuestStates.InProgress);
            assert.equal(result.details, "State 1");
            assert.equal(result.subtasks.length, 1);
            assert.equal(result.subtasks[0].description, "Task 1")
            assert.equal(result.subtasks[0].completed, true);
        });

        it("Visible Task - Error", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                states: [
                    {
                        state: QuestStates.InProgress,
                        description: "State 1",
                        condition: {
                            type: LogicTypes.Comparison,
                            quality: 1,
                            comparison: ComparisonTypes.Equal,
                            value: 10
                        },
                        tasks: [
                            {
                                description: "Task 1",
                                completed: {
                                    type: LogicTypes.Comparison,
                                    quality: 1,
                                    comparison: ComparisonTypes.Equal,
                                    value: 10
                                },
                                visible: {
                                    type: LogicTypes.Comparison,
                                    quality: 1,
                                    comparison: ComparisonTypes.Equal,
                                    value: 10
                                }
                            }
                        ]
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, "Quest Title");
            assert.equal(result.state, QuestStates.InProgress);
            assert.equal(result.details, "State 1");
            assert.equal(result.subtasks.length, 1);
            assert.equal(result.subtasks[0].description, "Task 1")
            assert.equal(result.subtasks[0].completed, true);
        });

        it("Invisible Task - Error", function(){
            renderer.qualities[1] = 10;
            const quest = {
                title: "Quest Title",
                states: [
                    {
                        state: QuestStates.InProgress,
                        description: "State 1",
                        condition: {
                            type: LogicTypes.Comparison,
                            quality: 1,
                            comparison: ComparisonTypes.Equal,
                            value: 10
                        },
                        tasks: [
                            {
                                description: "Task 1",
                                completed: {
                                    type: LogicTypes.Comparison,
                                    quality: 1,
                                    comparison: ComparisonTypes.Equal,
                                    value: 10
                                },
                                visible: {
                                    type: LogicTypes.Comparison,
                                    quality: 1,
                                    comparison: ComparisonTypes.NotEqual,
                                    value: 10
                                }
                            }
                        ]
                    }
                ]
            };
            const result = renderer.renderQuest(quest);
            assert.equal(result.title, "Quest Title");
            assert.equal(result.state, QuestStates.InProgress);
            assert.equal(result.details, "State 1");
            assert.equal(result.subtasks.length, 0);
        });
    });

    describe("#sortQuests()", function(){
        let renderer;
        this.beforeEach(function(){
            renderer = makeSpoofedRenderer();
        });

        it("No Parameters - No Error", function(){
            assert.doesNotThrow(function(){
                renderer.sortQuests();
            });
        });

        it("Sort States - Sorted", function(){
            const quests = [
                {
                    state: QuestStates.Completed,
                    order: 1
                },
                {
                    state: QuestStates.HiddenStatus,
                    order: 1
                },
                {
                    state: QuestStates.NotStart,
                    order: 1
                },
                {
                    state: QuestStates.InProgress,
                    order: 1
                },
                {
                    state: QuestStates.Blocked,
                    order: 1
                }
            ];
            renderer.sortQuests(quests);
            assert.equal(quests[0].state, QuestStates.InProgress);
            assert.equal(quests[1].state, QuestStates.Blocked);
            assert.equal(quests[2].state, QuestStates.NotStart);
            assert.equal(quests[3].state, QuestStates.HiddenStatus);
            assert.equal(quests[4].state, QuestStates.Completed);
        });

        it("Sort States - Sorted", function(){
            const quests = [
                {
                    state: QuestStates.Completed,
                    order: 2
                },
                {
                    state: QuestStates.Completed,
                    order: 1
                },
                {
                    state: QuestStates.Completed,
                    order: 3
                }
            ];
            renderer.sortQuests(quests);
            assert.equal(quests[0].order, 3);
            assert.equal(quests[1].order, 2);
            assert.equal(quests[2].order, 1);
        });

        it("Sort Both States & Order - State Prioritized", function(){
            const quests = [
                {
                    state: QuestStates.Completed,
                    order: 2
                },
                {
                    state: QuestStates.InProgress,
                    order: 1
                },
                {
                    state: QuestStates.Completed,
                    order: 3
                }
            ];
            renderer.sortQuests(quests);
            assert.equal(quests[0].state, QuestStates.InProgress)
            assert.equal(quests[0].order, 1);
            assert.equal(quests[1].state, QuestStates.Completed)
            assert.equal(quests[1].order, 3);
            assert.equal(quests[2].state, QuestStates.Completed)
            assert.equal(quests[2].order, 2);
        });
    });

    describe("#renderQuests()", function(){
        let renderer;
        this.beforeEach(function(){
            renderer = makeSpoofedRenderer();
        });

        it("No Parameters - Empty Result", function(){
            const result = renderer.renderQuests();
            assert.equal(result.length, 0);
        });

        it("No Categories Parameter - Empty Result", function(){
            const result = renderer.renderQuests({
            });
            assert.equal(result.length, 0);
        });

        it("Empty Categories Not Array - Empty Result", function(){
            const result = renderer.renderQuests({
                categories: "Test"
            });
            assert.equal(result.length, 0);
        });

        it("Category with No Quests Property - Empty Result", function(){
            const quests = {
                categories: [
                    {
                        id: "cat1",
                        title: "Category 1"
                    }
                ]
            };
            const result = renderer.renderQuests(quests);
            assert.equal(result.length, 0);
        });

        it("Category with Empty Quests - Empty Result", function(){
            const quests = {
                categories: [
                    {
                        id: "cat1",
                        title: "Category 1",
                        quests: []
                    }
                ]
            };
            const result = renderer.renderQuests(quests);
            assert.equal(result.length, 0);
        });

        it("Category with Quest without Matching State - Empty Result", function(){
            renderer.qualities[1] = 10;
            const quests = {
                categories: [
                    {
                        id: "cat1",
                        title: "Category 1",
                        quests: [
                            {
                                title: "Quest 1",
                                states: [
                                    {
                                        state: QuestStates.InProgress,
                                        description: "State 1",
                                        condition: {
                                            type: LogicTypes.Comparison,
                                            quality: 1,
                                            comparison: ComparisonTypes.Equal,
                                            value: 1
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            const result = renderer.renderQuests(quests);
            assert.equal(result.length, 0);
        });

        it("Category with Quest with Matching State - Category Rendered", function(){
            renderer.qualities[1] = 10;
            const quests = {
                categories: [
                    {
                        id: "cat1",
                        title: "Category 1",
                        order: 10,
                        quests: [
                            {
                                title: "Quest 1",
                                states: [
                                    {
                                        state: QuestStates.InProgress,
                                        description: "State 1",
                                        condition: {
                                            type: LogicTypes.Comparison,
                                            quality: 1,
                                            comparison: ComparisonTypes.Equal,
                                            value: 10
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            const result = renderer.renderQuests(quests);
            assert.equal(result.length, 1);
            assert.equal(result[0].id, "cat1");
            assert.equal(result[0].title, "Category 1");
            assert.equal(result[0].order, 10);
            assert.equal(result[0].quests.length, 1);
            assert.equal(result[0].quests[0].title, "Quest 1");
            assert.equal(result[0].quests[0].state, QuestStates.InProgress);
            assert.equal(result[0].quests[0].details, "State 1");
        });

        it("Category with Multiple Quests - Quests Sorted", function(){
            renderer.qualities[1] = 10;
            const quests = {
                categories: [
                    {
                        id: "cat1",
                        title: "Category 1",
                        order: 10,
                        quests: [
                            {
                                title: "Quest 1",
                                states: [
                                    {
                                        state: QuestStates.Completed,
                                        description: "State 1",
                                        condition: {
                                            type: LogicTypes.Comparison,
                                            quality: 1,
                                            comparison: ComparisonTypes.Equal,
                                            value: 10
                                        }
                                    }
                                ]
                            },
                            {
                                title: "Quest 2",
                                states: [
                                    {
                                        state: QuestStates.InProgress,
                                        description: "State 1",
                                        condition: {
                                            type: LogicTypes.Comparison,
                                            quality: 1,
                                            comparison: ComparisonTypes.Equal,
                                            value: 10
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };
            const result = renderer.renderQuests(quests);
            assert.equal(result.length, 1);
            assert.equal(result[0].id, "cat1");
            assert.equal(result[0].title, "Category 1");
            assert.equal(result[0].order, 10);
            assert.equal(result[0].quests.length, 2);
            assert.equal(result[0].quests[0].title, "Quest 2");
            assert.equal(result[0].quests[1].title, "Quest 1");
        });
    });
});