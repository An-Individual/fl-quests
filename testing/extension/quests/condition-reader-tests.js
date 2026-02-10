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

    test(`next() - "a" - Single Read`, async function(){
        const reader = new ConditionReader("a");
        assertEq(reader.next(), "a");
        assertEq(reader.lastIndex, 0);
        assertEq(reader.index, 1);
        assert(!reader.next());
    });
    
    test(`next() - "ab" - Single Read`, async function(){
        const reader = new ConditionReader("ab");
        assertEq(reader.next(), "ab");
        assertEq(reader.lastIndex, 0);
        assertEq(reader.index, 2);
        assert(!reader.next());
    });

    test(`next() - "12" - Single Read`, async function(){
        const reader = new ConditionReader("12");
        assertEq(reader.next(), "12");
        assertEq(reader.lastIndex, 0);
        assertEq(reader.index, 2);
        assert(!reader.next());
    });

    test(`next() - "a1a" - Three Reads`, async function(){
        const reader = new ConditionReader("a1a");
        assertEq(reader.next(), "a");
        assertEq(reader.lastIndex, 0);
        assertEq(reader.index, 1);
        assertEq(reader.next(), "1");
        assertEq(reader.lastIndex, 1);
        assertEq(reader.index, 2);
        assertEq(reader.next(), "a");
        assertEq(reader.lastIndex, 2);
        assertEq(reader.index, 3);
        assert(!reader.next());
    });

    test(`next() - " a 1 a " - Three Reads`, async function(){
        const reader = new ConditionReader(" a 1 a ");
        assertEq(reader.next(), "a");
        assertEq(reader.lastIndex, 1);
        assertEq(reader.index, 2);
        assertEq(reader.next(), "1");
        assertEq(reader.lastIndex, 3);
        assertEq(reader.index, 4);
        assertEq(reader.next(), "a");
        assertEq(reader.lastIndex, 5);
        assertEq(reader.index, 6);
        assert(!reader.next());
    });

    test(`next() - "!a" - Two Reads`, async function(){
        const reader = new ConditionReader("!a");
        assertEq(reader.next(), "!");
        assertEq(reader.next(), "a");
        assert(!reader.next());
    });

    test(`next() - "!(a)" - Four Reads`, async function(){
        const reader = new ConditionReader("!(a)");
        assertEq(reader.next(), "!");
        assertEq(reader.next(), "(");
        assertEq(reader.next(), "a");
        assertEq(reader.next(), ")");
        assert(!reader.next());
    });

    test(`next() - "!()" - Three Reads`, async function(){
        const reader = new ConditionReader("!()");
        assertEq(reader.next(), "!");
        assertEq(reader.next(), "(");
        assertEq(reader.next(), ")");
        assert(!reader.next());
    });

    test(`next() - "a.b" - Three Reads`, async function(){
        const reader = new ConditionReader("a.b");
        assertEq(reader.next(), "a");
        assertEq(reader.next(), ".");
        assertEq(reader.next(), "b");
        assert(!reader.next());
    });

    test(`next() - "a&b" - Three Reads`, async function(){
        const reader = new ConditionReader("a&b");
        assertEq(reader.next(), "a");
        assertEq(reader.next(), "&");
        assertEq(reader.next(), "b");
        assert(!reader.next());
    });
    
    test(`next() - "a&&b" - Three Reads`, async function(){
        const reader = new ConditionReader("a&&b");
        assertEq(reader.next(), "a");
        assertEq(reader.next(), "&&");
        assertEq(reader.next(), "b");
        assert(!reader.next());
    });

    test(`next() - "a|b" - Three Reads`, async function(){
        const reader = new ConditionReader("a|b");
        assertEq(reader.next(), "a");
        assertEq(reader.next(), "|");
        assertEq(reader.next(), "b");
        assert(!reader.next());
    });

    test(`next() - "a||b" - Three Reads`, async function(){
        const reader = new ConditionReader("a||b");
        assertEq(reader.next(), "a");
        assertEq(reader.next(), "||");
        assertEq(reader.next(), "b");
        assert(!reader.next());
    });

    test(`next() - "a=1" - Three Reads`, async function(){
        const reader = new ConditionReader("a=1");
        assertEq(reader.next(), "a");
        assertEq(reader.next(), "=");
        assertEq(reader.next(), "1");
        assert(!reader.next());
    });

    test(`next() - "a==1" - Three Reads`, async function(){
        const reader = new ConditionReader("a==1");
        assertEq(reader.next(), "a");
        assertEq(reader.next(), "==");
        assertEq(reader.next(), "1");
        assert(!reader.next());
    });

    test(`next() - "a>1" - Three Reads`, async function(){
        const reader = new ConditionReader("a>1");
        assertEq(reader.next(), "a");
        assertEq(reader.next(), ">");
        assertEq(reader.next(), "1");
        assert(!reader.next());
    });

    test(`next() - "a>=1" - Three Reads`, async function(){
        const reader = new ConditionReader("a>=1");
        assertEq(reader.next(), "a");
        assertEq(reader.next(), ">=");
        assertEq(reader.next(), "1");
        assert(!reader.next());
    });

    test(`next() - "a<1" - Three Reads`, async function(){
        const reader = new ConditionReader("a<1");
        assertEq(reader.next(), "a");
        assertEq(reader.next(), "<");
        assertEq(reader.next(), "1");
        assert(!reader.next());
    });

    test(`next() - "a<=1" - Three Reads`, async function(){
        const reader = new ConditionReader("a<=1");
        assertEq(reader.next(), "a");
        assertEq(reader.next(), "<=");
        assertEq(reader.next(), "1");
        assert(!reader.next());
    });
    
    
    test(`next() - "((a&&b==5)||c.level=32)" - Fifteen Reads`, async function(){
        const reader = new ConditionReader("((a&&b==5)||c.level=32)");
        assertEq(reader.next(), "(");
        assertEq(reader.next(), "(");
        assertEq(reader.next(), "a");
        assertEq(reader.next(), "&&");
        assertEq(reader.next(), "b");
        assertEq(reader.next(), "==");
        assertEq(reader.next(), "5");
        assertEq(reader.next(), ")");
        assertEq(reader.next(), "||");
        assertEq(reader.next(), "c");
        assertEq(reader.next(), ".");
        assertEq(reader.next(), "level");
        assertEq(reader.next(), "=");
        assertEq(reader.next(), "32");
        assertEq(reader.next(), ")");
        assert(!reader.next());
    });

    test(`next() - "@#*[]{}<>" - Nine Reads`, async function(){
        const reader = new ConditionReader("@#*[]{};,");
        assertEq(reader.next(), "@");
        assertEq(reader.next(), "#");
        assertEq(reader.next(), "*");
        assertEq(reader.next(), "[");
        assertEq(reader.next(), "]");
        assertEq(reader.next(), "{");
        assertEq(reader.next(), "}");
        assertEq(reader.next(), ";");
        assertEq(reader.next(), ",");
        assert(!reader.next());
    });

    test('nextThrowIfEnd() - Empty String - Throws', async function(){
        const reader = new ConditionReader("");
        assertThrows(function(){
            reader.nextThrowIfEnd();
        });
    })

    test('nextThrowIfEnd() - "a" - Throws after one', async function(){
        const reader = new ConditionReader("a");
        assertEq(reader.nextThrowIfEnd(), "a");
        assertEq(reader.lastIndex, 0);
        assertEq(reader.index, 1);
        assertThrows(function(){
            reader.nextThrowIfEnd();
        });
    })

    closeTests();
}())