import { initializeConnect } from "react-redux/es/components/connect";

/**
 * Implements a deep clone function of self
 */
export interface ICopiable {
    copy(): any;
}

/**
 * Implements initialization logic
 */
export interface IInitable {
    init(): boolean;
}

/**
 * Implements a clean up function
 */
export interface IDisposable {
    dispose(): void;
}

export type Primitive = string | number | bigint | boolean | undefined | symbol | null;