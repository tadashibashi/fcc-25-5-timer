import { ICopiable, Primitive } from "./Interfaces"

/**
 * Deep clones an array of copiable items. Assumes all items are Primitive or ICopiable of same array depth
 * @param arr - the array to clone
 */
export function cloneArray<T extends ICopiable>(arr: Array<T>): Array<T>;
export function cloneArray<T extends Primitive>(arr: Array<T>): Array<T>;
export function cloneArray<T extends Array<ICopiable>>(arr: Array<T>): Array<T>;
export function cloneArray<T extends Array<Primitive>>(arr: Array<T>): Array<T>;
export function cloneArray<T extends Array<any>>(arr: Array<any>): Array<any>;

export function cloneArray(arr: Array<any>): Array<any> {
    if (arr.length === 0) return [];

    if (arr[0].copy) {                  // ICopiable array
        return arr.map(item => item.copy())
    } else if (Array.isArray(arr[0])) { // Array of array
        return arr.map(item => cloneArray(item));
    } else {                            // Array of primitives
        return arr.slice();
    }
}
