import { Delegate } from "./Delegate"

const TIMEOUT_NULL = -1;
const MS_PER_SECOND = 1000.0;

export interface Timer {
    onZero: Delegate<[IntervalTimer]>;
    paused: boolean;
    id: number;
    time: number;
    maxTime: number;

    restart(): void;
    stop(): void;
}

/**
 * A timer that counts down to zero, uses Window Interval API
 */
export class IntervalTimer implements Timer {
    private mId: number;
    private mMaxTime: number;
    private mOnZero: Delegate<[IntervalTimer]>;
    private mOnStep: Delegate<[IntervalTimer, number]>;
    private mPaused: boolean;
    private mTime: number;

    private mIntervalHandle: number;

    constructor(maxTime: number = 0, id: number) {
        this.mId = id;
        this.mMaxTime = Math.max(maxTime, 0);
        this.mOnZero = new Delegate<[IntervalTimer]>;
        this.mOnStep = new Delegate<[IntervalTimer, number]>;
        this.mPaused = false;
        this.mTime = maxTime;

        this.mIntervalHandle = TIMEOUT_NULL;

        this.handleInterval = this.handleInterval.bind(this);
    }

    /**
     * Event delegate when timer reaches zero
     */
    get onZero() { return this.mOnZero; }
    get onStep() { return this.mOnStep; }

    get paused() { return this.mPaused; }
    set paused(pause: boolean) { this.mPaused = pause; }

    get id() { return this.mId; }

    get active() { return this.mIntervalHandle !== -1; }

    get time() { return this.mTime; }

    get maxTime() { return this.mMaxTime; }
    set maxTime(time: number) {
        if (time < 0)
            time = 0;

        this.mMaxTime = time;

        if (!this.active) // when inactive, set the internal time to the max time value
            this.mTime = time;
    }

    /**
     * Restart the timer (reactivate, and reset the timer to its maxTime)
     */
    restart() {
        this.clearInterval();
        this.mPaused = false;
        this.resetTime();

        this.setInterval();
    }

    /**
     * Stops timer and resets time
     */
    stop() {
        this.clearInterval();
        this.mPaused = false;
        this.resetTime();
    }

    resetTime() {
        this.mTime = this.mMaxTime;
    }

    private handleInterval() {
        this.update(1);
        this.onStep.invoke(this, this.mTime);
    }

    private setInterval() {
        this.clearInterval();

        this.mIntervalHandle = window.setInterval(this.handleInterval, MS_PER_SECOND);
    }

    private clearInterval() {
        if (this.mIntervalHandle !== TIMEOUT_NULL) {
            window.clearInterval(this.mIntervalHandle);
            this.mIntervalHandle = TIMEOUT_NULL;
        }
    }

    /**
     * Update the timer internals. Intended to be driven by an owner class.
     * @param deltaTime in seconds
     */
    private update(deltaTime: number) {
    
        if (this.mPaused)
            return;

        this.mTime -= deltaTime;
        if (this.mTime < 0) {

            this.mOnZero.invoke(this);
            this.stop();
        }
    }
}