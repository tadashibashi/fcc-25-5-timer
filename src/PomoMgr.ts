import { Delegate } from "./Delegate";
import { IntervalTimer } from "./Timer"

export enum TimerId {
    Break = 0,
    Session
}

export class PomoMgr {
    private mBreak: IntervalTimer;
    private mSession: IntervalTimer;
    private mActive: IntervalTimer;

    public onZero: Delegate<[TimerId]>;
    public onStep: Delegate<[TimerId, number]>;

    constructor() {
        this.mBreak = new IntervalTimer(5 * 60, TimerId.Break);
        this.mSession = new IntervalTimer(25 * 60, TimerId.Session);
        this.onZero = new Delegate;
        this.onStep = new Delegate;
        this.mBreak.onZero.subscribe(this.handleZero, this);
        this.mSession.onZero.subscribe(this.handleZero, this);
        this.mBreak.onStep.subscribe(this.handleStep, this);
        this.mSession.onStep.subscribe(this.handleStep, this);

        this.mActive = this.mSession;
    }

    get break() { return this.mBreak; }
    get session() { return this.mSession; }

    startBreak() {
        this.start(this.mBreak);
    }

    private handleStep(t: IntervalTimer, time: number) {
        this.onStep.invoke(t.id as TimerId, time);
    }

    startSession() {
        this.start(this.mSession);
    }

    isBreak() {
        this.mActive.id === TimerId.Break;
    }

    isSession() {
        this.mActive.id === TimerId.Session;
    }

    get active() {
        return this.mActive;
    }

    setPause(pause: boolean) {
        if (this.mActive) {
            this.mActive.paused = pause;
        }
    }

    isPaused() {
        return (this.mActive && this.mActive.paused);
    }

    reset(sessionTime: number, breakTime: number) {
        this.mActive.stop();
        this.mActive = this.mSession;
        this.mSession.maxTime = sessionTime;
        this.mSession.resetTime();
        this.mBreak.maxTime = breakTime;
        this.mBreak.resetTime();
    }

    private start(timer: IntervalTimer) {
        
        // Stop other active timer
        if (!Object.is(timer, this.mActive)) {
            this.mActive.stop();
            this.mActive = timer; 
        }

        // Start/restart this one
        timer.restart();
    }

    private handleZero(timer: IntervalTimer) {
        if (timer.id === TimerId.Break)
            this.mActive = this.mSession;
        else
            this.mActive = this.mBreak;

        this.mActive.restart(); // for now swap and restart once it hits zero
        this.onZero.invoke(timer.id);
    }
}
