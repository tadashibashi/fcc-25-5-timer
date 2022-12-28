import { Delegate } from "../src/Delegate";

describe("Delegate", () => {
    test("Subscribes to a local function, no args", () => {
        let testVal = 0;
        function func() {
            testVal+= 1;
        }

        const delegate = new Delegate<[]>;

        expect(delegate.length).toBe(0);
        delegate.subscribe(func);

        expect(delegate.length).toBe(1);
        
        delegate.invoke();

        expect(testVal).toBe(1);

        delegate.invoke();

        expect(testVal).toBe(2);

        delegate.unsubscribe(func);

        expect(delegate.length).toBe(0);

        delegate.invoke(); // invoke on nothing

        expect(testVal).toBe(2); // testVal remains unaltered from the last check
    });

    test("Subscribes to a local function, one arg", () => {
        let testVal = 0;
        function func(n: number) {
            testVal+= n;
        }

        const delegate = new Delegate<[number]>;

        expect(delegate.length).toBe(0);
        delegate.subscribe(func);

        expect(delegate.length).toBe(1);
        
        delegate.invoke(10);

        expect(testVal).toBe(10);

        delegate.invoke(20);

        expect(testVal).toBe(30);

        delegate.unsubscribe(func);

        expect(delegate.length).toBe(0);

        delegate.invoke(10); // invoke on nothing

        expect(testVal).toBe(30); // testVal remains unaltered from the last check
    });

    test("Delegate subscribes to class member function, no args", () => {
        class TestClass {
            constructor(public val = 0) {}

            func() {
                this.val += 1;
            }
        }

        const testObj = new TestClass;

        const delegate = new Delegate<[]>;

        expect(delegate.length).toBe(0);
        delegate.subscribe(testObj.func, testObj);

        expect(delegate.length).toBe(1);
        
        delegate.invoke();

        expect(testObj.val).toBe(1);

        delegate.invoke();

        expect(testObj.val).toBe(2);

        delegate.unsubscribe(testObj.func, testObj);

        expect(delegate.length).toBe(0);

        delegate.invoke(); // invoke on nothing

        expect(testObj.val).toBe(2); // testVal remains unaltered from the last check
    });

    test("Delegate subscribes to class member function, one arg", () => {
        class TestClass {
            constructor(public val = 0) {}

            func(n: number) {
                this.val += n;
            }
        }

        const testObj = new TestClass;

        const delegate = new Delegate<[number]>;

        expect(delegate.length).toBe(0);
        delegate.subscribe(testObj.func, testObj);

        expect(delegate.length).toBe(1);
        
        delegate.invoke(10);

        expect(testObj.val).toBe(10);

        delegate.invoke(20);

        expect(testObj.val).toBe(30);

        delegate.unsubscribe(testObj.func, testObj);

        expect(delegate.length).toBe(0);

        delegate.invoke(10); // invoke on nothing

        expect(testObj.val).toBe(30); // testVal remains unaltered from the last check
    });

    test("Bound function maintains 'this' context when thisArg is undefined", () => {
        class TestClass {
            func: () => void;
            var: number;

            constructor() {
                this.var = 0;
                this.func = () => { this.var++; }
            }
        }

        const testObj = new TestClass();
        const delegate = new Delegate<[]>();

        delegate.subscribe(testObj.func);

        expect(delegate.length).toBe(1);
        expect(testObj.var).toBe(0);

        delegate.invoke();

        expect(testObj.var).toBe(1);

        delegate.unsubscribe(testObj.func);

        expect(delegate.length).toBe(0);

        delegate.invoke();

        expect(testObj.var).toBe(1);
    });
});