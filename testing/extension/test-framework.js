class TestCollection {
    constructor(name) {
        this.name = name;
        this.tests = [];
    }

    addTest(name, func) {
        this.tests.push({
            name: name,
            func: func
        });
    }
}

class AssertError extends Error {
    constructor(message) {
        if(message) {
            super(`Assert failed. ${message}`);
        } else {
            super("Assert failed.");
        }
    }
}

class AssertEqualError extends Error {
    constructor(actual, expected, message) {
        if(message) {
            super(`Value "${actual}" does not match expected value "${expected}". ${message}`);
        } else {
            super(`Value "${actual}" does not match expected value "${expected}".`);
        }
    }
}

function assert(assertion, message) {
    if(!assertion) {
        throw new AssertError(message);
    }
}

function assertEq(actual, expected, message) {
    if(actual !== expected) {
        throw new AssertEqualError(actual, expected, message);
    }
}

const frame_testCollection = [];
let frame_currentCollection = null;

function declareTests(name) {
    if(frame_currentCollection) {
        throw new Error(`Test collection "${frame_currentCollection.name}" not closed.`)
    }

    frame_currentCollection = new TestCollection(name)
    frame_testCollection.push(frame_currentCollection);
}

function closeTests() {
    frame_currentCollection = null;
}

function setupGlobal(func) {
    if(!frame_currentCollection) {
        throw new Error("No test collection has been declared");
    }

    frame_currentCollection.setupGlobal = func;
}

function teardownGlobal(func) {
    if(!frame_currentCollection) {
        throw new Error("No test collection has been declared");
    }

    frame_currentCollection.teardownGlobal = func;
}

function setup(func){
    if(!frame_currentCollection) {
        throw new Error("No test collection has been declared");
    }

    frame_currentCollection.setup = func;
}

function teardown(func){
    if(!frame_currentCollection) {
        throw new Error("No test collection has been declared");
    }

    frame_currentCollection.teardown = func;
}

function test(name, func) {
    if(!frame_currentCollection) {
        throw new Error("No test collection has been declared");
    }

    frame_currentCollection.addTest(name, func);
}

let frame_outputElement = null;
function setTestOutput(outputElement) {
    frame_outputElement = outputElement
}

async function executeTests() {
    function writeLine(depth, line) {
        let whitespace = "";
        for(let i = 0; i < depth; i++) {
            whitespace += "    ";
        }
        if(line) { 
            line = line.replace(`\n`, `\n${whitespace}`);
        }
        frame_outputElement.innerText += whitespace + line + "\n";
    }
    
    writeLine(0, "Starting Tests...");

    let totalTests = 0;
    let totalCompleted = 0;
    let totalFailed = 0;
    for(const colIdx in frame_testCollection) {
        const testCol = frame_testCollection[colIdx];
        let total = 0;
        let completed = 0;
        let failed = 0;

        if(testCol.setupGlobal) {
            try {
                await testCol.setupGlobal();
            } catch (error) {
                writeLine(1, `Global setup error from ${testCol.name}: ${error}\n${error.stack}`);
                continue;
            }
        }
        
        for(const testIdx in testCol.tests) {
            const test = testCol.tests[testIdx];
            total++
            totalTests++;

            try {
                if(testCol.setup){
                    await testCol.setup();
                }
                await test.func();
                if(testCol.teardown) {
                    await testCol.teardown();
                }
                completed++;
                totalCompleted++;
            } catch(error) {
                test.error = error;
                failed++;
                totalFailed++;
            }
        }

        if(failed) {
            writeLine.apply(1, `${testCol.name} failed (${completed}/${total})`);
            for(const testIdx in testCol.tests) {
                const test = testCol.tests[testIdx];
                if(test.error) {
                    writeLine(2, `${test.name} failed: ${test.error}\n${test.error.stack}`);
                }
            }
        } else {
            writeLine(1, `${testCol.name} passed (${completed}/${total})`);
        }

        if(testCol.teardownGlobal) {
            try {
                await testCol.teardownGlobal();
            } catch (error) {
                writeLine(1, `Global teardown error from ${testCol.name}: ${error}\n${error.stack}`);
                continue;
            }
        }
    }

    if(totalFailed) {
        writeLine(0, `Tests Failed (${totalCompleted}/${totalTests})`);
    } else {
        writeLine(0, `Tests Successful (${totalCompleted}/${totalTests})`);
    }
}