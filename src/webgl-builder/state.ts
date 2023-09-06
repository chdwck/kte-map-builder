import { CellStyle, CellStyleKey, Vec2, cellStyles, nothing } from "./common";
import { clearStoredState, loadStoredState } from "./storage";

export type MapBuilderOptions = {
    cellCountY: number;
    cellCountX: number;
    cellSize: number;
};

export type MapBuilderState = {
    cellMap: Record<string, CellStyleKey>;
    options: MapBuilderOptions;
};

export function canvasHeightPx(state: MapBuilderState) {
    return state.options.cellCountY * state.options.cellSize;
}

export function canvasWidthPx(state: MapBuilderState) {
    return state.options.cellCountX * state.options.cellSize;
}

export function initState(): MapBuilderState {
    const [error, prevState] = loadStoredState();
    if (error) {
        clearStoredState();
        return {
            cellMap: {},
            options: {
                cellCountX: 50,
                cellCountY: 50,
                cellSize: 20
            }
        }
    }

    return prevState;
}

export function setCell(state: MapBuilderState, cellPos: Vec2, key: CellStyleKey) {
    const _cellKey = cellKey(cellPos);
    if (key === nothing.id) {
        delete state.cellMap[_cellKey]
    } else {
        state.cellMap[_cellKey] = key;
    }
}

export function getCellStyle(state: MapBuilderState, pos: Vec2): CellStyle {
    const key = state.cellMap[cellKey(pos)];
    if (!key) {
        return nothing;
    }

    return cellStyles[key];
}

export function cellKey(pos: Vec2): string {
    return `${pos[0]}_${pos[1]}`;
}
