import { cloneArray } from "../src/Common"
import { ICopiable } from "../src/Interfaces"

class TestClass implements ICopiable {
    val: number;
    constructor(num = 0) { this.val = num; }

    copy() {
        return new TestClass(this.val);
    }
}

describe("cloneArray", () => {
    test("Array of number primitives", () => {
        const arr = [0, 1, 2, 3];
        const cloned = cloneArray(arr);

        expect(cloned).toStrictEqual(arr);        // Array values are equal
        expect(cloned === arr).toBe(false); // References should not be equal since it's cloned.
    });
    test("Empty array", () => {
        const arr = [];
        const cloned = cloneArray(arr);

        expect(cloned).toStrictEqual(arr);
        expect(cloned === arr).toBe(false);
    });
    test("Array of ICopiable", () => {
        const arr = [new TestClass(10), new TestClass(20), new TestClass(30)];
        const cloned = cloneArray(arr);

        expect(cloned).toStrictEqual(arr);
        expect(cloned === arr).toBe(false);
    });
    test("Array of array of numbers", () => {
        const arr = [[0], [1,2,3], [], [44, 123, 14, 15], []];
        const cloned = cloneArray(arr);

        expect(cloned).toStrictEqual(arr);
        expect(cloned === arr).toBe(false);
    });
    test("Array of array, with mixed primitives", () => {
        const arr = [[""], [], [44, "hello", 15, "world"], [2,"",-13]];
        const cloned = cloneArray(arr);

        expect(cloned).toStrictEqual(arr);
        expect(cloned === arr).toBe(false);
    });
    test("Array of array, multiple nested with numbers", () => {
        const arr = [[[0]], [[]], [[44], [123, 123, 15], [14], [5]], [[2, 3, 4],[3],[4]]];
        const cloned = cloneArray(arr);

        expect(cloned).toStrictEqual(arr);
        expect(cloned === arr).toBe(false);
    });
});
