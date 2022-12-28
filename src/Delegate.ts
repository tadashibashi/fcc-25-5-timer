
/**
 * Privately used to wrap individual functions in a Delegate
 */
class DelegateFunc {
    private func: Function;
    private thisArg: any;

    constructor(func: Function, thisArg?: any) {
        this.func = func;
        this.thisArg = thisArg;
    }

    /**
     * Comparison with another DelegateFunc
     */
    equals(other: DelegateFunc) {
        return other.func === this.func &&
            other.thisArg === this.thisArg;
    }

    /**
     * Checks if matching signatures (func, thisArg)
     */
    matches(func: Function, thisArg?: any) {
        return func === this.func && thisArg === this.thisArg;
    }

    /**
     * Call the function
     * @param any 
     */
    invoke(...any: any[]) {
        if (this.thisArg) {
            this.func.call(this.thisArg, ...any);
        } else {
            this.func(...any);
        }   
    }
}

/**
 * Event emitter inspired by the Action class in C#.
 */
export class Delegate<TArgs extends any[]> {
    
    private callbacks: Array<DelegateFunc>;

    constructor() {
        this.callbacks = [];
    }

    /**
     * Adds a function to listen for the event. Please remember to call
     * unsubscribe() to remove the listener when the object is intended to go out of scope
     * in order to free all references to it.
     * @param func - function reference. Should not be pre-bound, since this
     * is handled for you automatically when you specify the thisArg param.
     * @param thisArg - this context object, if any. Left undefined, will keep
     * the original context.
     */
    subscribe(func: (...args: TArgs) => void, thisArg?: any): void {
        if (this.indexOfMatch(func, thisArg) === -1) {
            this.callbacks.push(new DelegateFunc(func, thisArg));
        }
    }

    /**
     * Removes a function from the Delegate. Please make sure to call this for
     * every call to subscribe().
     * @param func - function reference. Should not be pre-bound, since this
     * is handled automatically in Delegate.subscribe() when you specify the thisArg param.
     * @param thisArg - this context object, if any.
     */
    unsubscribe(fn: (...args: TArgs) => void, thisArg?: any): void {
        const index = this.indexOfMatch(fn, thisArg);

        if (index !== -1) {
            this.callbacks.splice(index, 1);
        }
    }

    /**
     * Invokes every internal callback. Should be called only when the 
     * intended event occurs.
     * @param args
     */
    invoke(...args: TArgs) {
        this.callbacks.forEach(func => func.invoke(...args));
    }

    /**
     * Number of callbacks in the delegate
     */
    get length() { return this.callbacks.length; }

    /**
     * Removes every callback
     */
    reset() {
        this.callbacks = [];
    }

    /**
     * Checks function ref and this arg for a match in the callback array
     * @returns index if found, or -1 if not.
     */
    private indexOfMatch(func: Function, thisArg: any) {
        for (let i = 0; i < this.callbacks.length; ++i) {
            if (this.callbacks[i].matches(func, thisArg))
                return i;
        }

        return -1;
    }
}
