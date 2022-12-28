import * as React from "react";
import * as ReactDOM from "react-dom/client"
import { PomoMgr, TimerId } from "./PomoMgr"
import { configureStore } from "@reduxjs/toolkit"
import { connect, Provider } from "react-redux";

function Label(props: {id: string, children: any}) {
    return (
        <div id={props.id} className="label">{props.children}</div>
    );
}

interface IncDecProps {
    id: string;
    onClick: (button: IncDecButton) => void;
    children: string;
}

class IncDecButton extends React.Component<IncDecProps> {
    constructor(props) {
        super(props)
    }

    get text() { return this.props.children; }

    render() {
        return (
            <button id={this.props.id} className={this.props.children === "+" ? "inc" : "dec"} onClick={() => {this.props.onClick(this);}}>{this.props.children}</button>
        );
    }
}

enum TimerName {
    Break = "Break",
    Session = "Session"
}

const AppDefaults = {
    ActiveName: TimerName.Session,
    SessionTime: 60 * 25,
    BreakTime: 60 * 5
};

class App extends React.Component {
    pomo: PomoMgr;
    props: any;
    alarmSound: HTMLAudioElement;

    constructor(props) {
        super(props);

        this.pomo = new PomoMgr;

        this.pomo.onZero.subscribe(this.handleZero, this);
        this.pomo.onStep.subscribe(this.handleStep, this);
        this.handleIncDecButtonClick = this.handleIncDecButtonClick.bind(this);
        this.handleStartButtonClick = this.handleStartButtonClick.bind(this);
        this.handleResetButtonClick = this.handleResetButtonClick.bind(this);

        this.alarmSound = new Audio("./alarm.wav");
        this.alarmSound.id = "beep";
        document.body.appendChild(this.alarmSound);
    }

    // ===== Event Handlers ====================================

    private handleZero(timerId: TimerId) {
        console.log("Timer with id " + timerId + " reached zero");
        if (timerId === TimerId.Session)
            this.startTimer(TimerId.Break);
        else
            this.startTimer(TimerId.Session);

        if (this.alarmSound.readyState === this.alarmSound.HAVE_ENOUGH_DATA)
            this.alarmSound.play();
    }

    private startTimer(timerId: TimerId) {
        if (timerId === TimerId.Session) {
            this.pomo.startSession();
            this.props.startTimer(TimerName.Session, this.pomo.session.maxTime);
        } else {
            this.pomo.startBreak();
            this.props.startTimer(TimerName.Break, this.pomo.break.maxTime);
        }

        // this.props.setBlink(true);

        // const setBlink = this.props.setBlink;
        // const timeout = window.setTimeout(() => {
        //     setBlink(false);
        //     clearTimeout(timeout);
        // }, 20);
    }

    private handleStep(timerId: TimerId, time: number) {
        console.log("TimerId: " + timerId + ", time: " + time);
        if (timerId === TimerId.Break) {
            this.props.setBreakTime(this.pomo.break.time);
        } else {
            this.props.setSessionTime(this.pomo.session.time);
        }
    }

    private reset() {
        this.props.resetApp(AppDefaults.ActiveName, AppDefaults.SessionTime, AppDefaults.BreakTime);
        this.pomo.reset(AppDefaults.SessionTime, AppDefaults.BreakTime);
        this.alarmSound.pause();
        this.alarmSound.fastSeek(0);
    }

    private handleIncDecButtonClick(button: IncDecButton) {
        let isBreak: boolean;
        let increment: boolean;
        
        switch(button.props.id) {
            case "break-increment":
                isBreak = true;
                increment = true;
                break;
            case "break-decrement":
                isBreak = true;
                increment = false;
                break;
            case "session-increment":
                isBreak = false;
                increment = true;
                break;
            case "session-decrement":
                isBreak = false;
                increment = false;
                break;
            default:
                console.log("Unknown IncDecButton id: " + button.props.id);
                return;
        }

        if (isBreak) {
            let val = this.pomo.break.maxTime + (increment ? 60 : -60);
            val = Math.min(Math.max(60, val), 60 * 60);
            this.props.setBreakMax(val);
            this.pomo.break.maxTime = val;

            // Reset time also if not active
            if (!this.pomo.break.active) {
                this.props.setBreakTime(val);
                this.pomo.break.resetTime();
            }
        } else {
            let val = this.pomo.session.maxTime + (increment ? 60 : -60);
            val = Math.min(Math.max(60, val), 60 * 60);
            this.props.setSessionMax(val);
            this.pomo.session.maxTime = val;

            // Reset time also if not active
            if (!this.pomo.session.active) {
                this.props.setSessionTime(val);
                this.pomo.session.resetTime();
            }
        }
    }

    handleStartButtonClick() {
        if (this.pomo.active.active) {
            const paused = !this.pomo.isPaused();
            this.pomo.setPause(paused);
            this.props.setPaused(paused)
        } else {
            this.startTimer(this.pomo.active.id as TimerId);
        }
    }

    handleResetButtonClick() {
        this.reset();
    }

    override render() {

        // Get time display
        const time = this.props.time.activeName === TimerName.Session ?
            this.props.time.sessionTime :
            this.props.time.breakTime;
        let mins = Math.floor(time / 60).toString();
        let secs = Math.floor(time % 60).toString();

        // Zero pad time display to match format mm:ss
        if (mins.length === 1)
            mins = '0' + mins;
        if (secs.length === 1)
            secs = '0' + secs;

        // Get Start button text: "Start" or "Paused"
        let startText: string;
        if (this.pomo.active.active) {
            if (this.props.time.paused)
                startText = "Start";
            else
                startText = "Pause";
        } else {
            startText = "Start";
        }

        // Rendering
        return (
        <div id="app-container">
            <div className="greenery">
                <div className="leaf left"></div>
                <div className="leaf right"></div>
                <div className="leaf center left"></div>
                <div className="leaf center right"></div>
                <div className="leaf stem"></div>
            </div>

            <h1>Pomo Timer</h1>
            <div id="length-settings">
                <div className="length-setting">
                    <Label id="break-label">Break Length</Label>

                    <IncDecButton id="break-decrement" onClick={this.handleIncDecButtonClick}>-</IncDecButton>
                    <p id="break-length">{this.props.time.breakMax/60}</p>
                    <IncDecButton id="break-increment" onClick={this.handleIncDecButtonClick}>+</IncDecButton>
                </div>
                
                <div className="length-setting">
                    <Label id="session-label">Session Length</Label>

                    <IncDecButton id="session-decrement" onClick={this.handleIncDecButtonClick}>-</IncDecButton>
                    <p id="session-length">{this.props.time.sessionMax/60}</p>
                    <IncDecButton id="session-increment" onClick={this.handleIncDecButtonClick}>+</IncDecButton>
                </div>
            </div>
            

            <div id="display">
                <div id="timer-label">{this.props.time.blink ? "" : this.props.time.activeName}</div>
                <div id="time-left">{this.props.time.blink ? "" : (mins + ":" + secs)}</div>
            </div>
            <div id="controls">
                <button id="start_stop" onClick={this.handleStartButtonClick}>{startText}</button>
                <button id="reset" onClick={this.handleResetButtonClick}>Reset</button>
            </div>

        </div>);
    }
}


enum ActionType {
    BreakSetMaxTime,
    SessionSetMaxTime,
    BreakSetTime,
    SessionSetTime,
    ActiveName,
    StartTimer,
    SetPaused,
    SetBlink,
    Reset
}

interface TimeState {
    breakMax: number;
    breakTime: number;
    sessionMax: number;
    sessionTime: number;
    blink: boolean;
    activeName: string;
    paused: boolean;
}

function copyTimeState(state: TimeState): TimeState {
    return {
        activeName: state.activeName,
        breakMax: state.breakMax,
        breakTime: state.breakTime,
        sessionMax: state.sessionMax,
        sessionTime: state.sessionTime,
        paused: state.paused,
        blink: state.blink
    }
}

interface TimeAction {
    type: ActionType;
    data?: number | string | boolean | {name: string, time: number} | {name: string, breakTime: number, sessionTime: number};
}

const defaultTimeState = {
    activeName: TimerName.Session,
    breakMax: AppDefaults.BreakTime,
    breakTime: AppDefaults.BreakTime,
    sessionMax: AppDefaults.SessionTime,
    sessionTime: AppDefaults.SessionTime,
    paused: false,
    blink: false
};

function timeReducer(state: TimeState, action: TimeAction) {
    switch(action.type) {
        case ActionType.BreakSetMaxTime: {
            const copy = copyTimeState(state);
            copy.breakMax = action.data as number;
            return copy;
        }

        case ActionType.SessionSetMaxTime: {
            const copy = copyTimeState(state);
            copy.sessionMax = action.data as number;
            return copy;
        }

        case ActionType.BreakSetTime: {
            const copy = copyTimeState(state);
            copy.breakTime = action.data as number;
            return copy;
        }

        case ActionType.SessionSetTime: {
            const copy = copyTimeState(state);
            copy.sessionTime = action.data as number;
            return copy;
        }

        case ActionType.ActiveName: {
            const copy = copyTimeState(state);
            copy.activeName = action.data as string;
            return copy;
        }

        case ActionType.StartTimer: {
            const copy = copyTimeState(state);
            const data = action.data as {name: string, time: number};
            copy.activeName = data.name;
            if (data.name === TimerName.Session) {
                copy.sessionMax = data.time;
                copy.sessionTime = data.time;
            } else {
                copy.breakMax = data.time;
                copy.breakTime = data.time;
            }

            return copy;
        }

        case ActionType.SetPaused: {
            const copy = copyTimeState(state);
            copy.paused = action.data as boolean;
            return copy;
        }

        case ActionType.SetBlink: {
            const copy = copyTimeState(state);
            copy.blink = action.data as boolean;
            return copy;
        }

        case ActionType.Reset: {
            const data = action.data as {name: string, breakTime: number, sessionTime: number};
            return {
                breakMax: data.breakTime,
                breakTime: data.breakTime,
                sessionMax: data.sessionTime,
                sessionTime: data.sessionTime,
            
                activeName: data.name,
                paused: false,
                blink: false
            } as TimeState;
        }

        default:
            return state;
    }
}

// ===== Redux Integration ====================================================
const store = configureStore({
    reducer: timeReducer,
    preloadedState: defaultTimeState
});

function mapStateToProps(state: TimeState) {
    return {
        time: state
    };
}

function mapDispatcherToProps(dispatch: React.Dispatch<TimeAction>) {
    return {
        setBreakMax(seconds: number) {
            dispatch({
                type: ActionType.BreakSetMaxTime,
                data: seconds
            });
        },
        setSessionMax(seconds: number) {
            dispatch({
                type: ActionType.SessionSetMaxTime,
                data: seconds
            });
        },
        setBreakTime(seconds: number) {
            dispatch({
                type: ActionType.BreakSetTime,
                data: seconds
            });
        },
        setSessionTime(seconds: number) {
            dispatch({
                type: ActionType.SessionSetTime,
                data: seconds
            });
        },
        setActiveName(name: string) {
            dispatch({
                type: ActionType.ActiveName,
                data: name
            });
        },
        setPaused(pause: boolean) {
            dispatch({
                type: ActionType.SetPaused,
                data: pause
            });
        },
        setBlink(blink: boolean) {
            dispatch({
                type: ActionType.SetBlink,
                data: blink
            });
        },
        startTimer(name: string, maxTime: number) {
            dispatch({
                type: ActionType.StartTimer,
                data: {name: name, time: maxTime}
            });
        },
        resetApp(name: string, sessionTime: number, breakTime: number) {
            dispatch({
                type: ActionType.Reset,
                data: {name, sessionTime, breakTime}
            });
        }
    }
}

const Container = connect(mapStateToProps, mapDispatcherToProps)(App);

class AppWrapper extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Provider store={store}>
                <Container></Container>
            </Provider>
        );
    }
}

export const entryPoint = (function() {
    const root = ReactDOM.createRoot(document.getElementById("clock"));

    if (!root) {
        console.error("Failed to create React root.");
        return;
    }

    return function() {
        root.render(<AppWrapper />);
    };
})();
