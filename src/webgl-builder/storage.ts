import { Result } from "./common";
import { MapBuilderState } from "./state";

const localStorageKey = 'kte-map-state-v1';

export function storeState(state: MapBuilderState): boolean {
    try {
        localStorage.setItem(localStorageKey, JSON.stringify(state))
        return true;
    } catch {
        return false;
    }
}

export function loadStoredState(): Result<MapBuilderState> {
    const str = localStorage.getItem(localStorageKey);
    if (!str) {
        return [new Error("No stored state found.")];
    }

    try {
        const state = JSON.parse(str);
        return [undefined, state];
    } catch {
        return [new Error("Failed to deserialize stored state.")];
    }
}

export function clearStoredState() {
 localStorage.removeItem(localStorageKey);
}
