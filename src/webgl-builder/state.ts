import { CellStyle, CellStyleKey, MetaFieldset, Result, Vec2, cellStyles, getXYRanges, metaFieldGenerators, nothing } from "./common";
import { clearStoredState, loadStoredState, storeState } from "./storage";

export type MapBuilderOptions = {
    cellCountY: number;
    cellCountX: number;
    cellSize: number;
};

export type MapBuilderState = {
    cellMap: Record<string, CellStyleKey>;
    options: MapBuilderOptions;
    metaFieldsets: Record<string, MetaFieldset>;
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
            },
            metaFieldsets: {}
        }
    }

    return prevState;
}

export function updateArea(state: MapBuilderState, style: CellStyleKey) {
    if (!window.__kteDragCoords) {
        return;
    }
    const [xStart, yStart, xEnd, yEnd] = getXYRanges(window.__kteDragCoords);

    for (let y = yStart; y <= yEnd; y++) {
        for (let x = xStart; x <= xEnd; x++) {
            setCell(state, [x, y], style);
        }
    }

    window.__kteDragCoords = undefined;
    const success = storeState(state);
    if (!success) {
        alert("Failed to store map state.")
    }
}

export function updateOption(
    state: MapBuilderState,
    field: keyof MapBuilderOptions,
    value: number
) {
    state.options[field] = value;
    window.__kteGl.uniform1f(window.__kteUniforms.cellSize, state.options.cellSize);
    const success = storeState(state);
    if (!success) {
        alert("Failed to store map state.")
    }
}

export function setCell(state: MapBuilderState, cellPos: Vec2, key: CellStyleKey) {
    const _cellKey = cellKey(cellPos);
    if (key === nothing.id) {
        delete state.cellMap[_cellKey]
        if (state.metaFieldsets[_cellKey]) {
            delete state.metaFieldsets[_cellKey]
        }
    } else {
        state.cellMap[_cellKey] = key;
        const metaFieldGenerator = metaFieldGenerators[key];
        if (metaFieldGenerator) {
            state.metaFieldsets[_cellKey] = metaFieldGenerator()
        } else if (state.metaFieldsets[_cellKey]) {
            delete state.metaFieldsets[_cellKey]
        }
    }
}

export function updateMetaFieldSet(
    state: MapBuilderState,
    cellKey: string,
    fieldKey: keyof MetaFieldset,
    value: string
) {
    if (!state.metaFieldsets[cellKey]) {
        return;
    }

    if (!state.metaFieldsets[cellKey][fieldKey]) {
        return;
    }

    state.metaFieldsets[cellKey][fieldKey].value = value;
    storeState(state);
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

export function stringifyState(state: MapBuilderState): string {
    const matrix = [];
    for (let y = 0; y < state.options.cellCountY; y++) {
        const row = [];
        for (let x = 0; x < state.options.cellCountX; x++) {
            row.push(getCellStyle(state, [x, y]).id)
        }
        matrix.push(row)
    }

    const cleanFieldsets: Record<string, Record<string, string>> = {};
    const cellKeys = Object.keys(state.metaFieldsets);
    for (let i = 0; i < cellKeys.length; i++) {
        const fieldsetKey = cellKeys[i];
        const fieldset = state.metaFieldsets[fieldsetKey];
        const fieldKeys = Object.keys(fieldset);
        cleanFieldsets[fieldsetKey] = {};
        for (let j = 0; j < fieldKeys.length; j++) {
            const fieldKey = fieldKeys[j];
            cleanFieldsets[fieldsetKey][fieldKey] = state.metaFieldsets[fieldsetKey][fieldKey].value;
        }
    }

    const res = { matrix, meta: cleanFieldsets };
    return JSON.stringify(res);
}

export function parseState(state: MapBuilderState, stateStr: string): Error | undefined {
    try {
        const parsed = JSON.parse(stateStr);
        if (!parsed.matrix) {
            return new Error("Missing field matrix.");

        }

        if (!parsed.meta) {
            return new Error("Missing field meta.");
        }

        state.options.cellCountY = parsed.matrix.length;
        state.options.cellCountX = parsed.matrix[0].length;

        for (let y = 0; y < parsed.matrix.length; y++) {
            for (let x = 0; x < parsed.matrix[0].length; x++) {
                const cell = parsed.matrix[y][x];
                if (cell !== nothing.id && cellStyles[cell]) {
                    state.cellMap[cellKey([x, y])] = cell;
                }
            }
        }

        const cellKeys = Object.keys(parsed.meta);
        for (let i = 0; i < cellKeys.length; i++) {
            const cellKey = cellKeys[i];
            const fieldset = parsed.meta[cellKey];
            const fieldKeys = Object.keys(fieldset);
            const cellType = state.cellMap[cellKey];
            if (cellType === nothing.id || !cellStyles[cellType]) {
                continue;
            }
            state.metaFieldsets[cellKey] = metaFieldGenerators[cellType]();
            for (let j = 0; j < fieldKeys.length; j++) {
                const fieldKey = fieldKeys[j];
                const fieldVal = fieldset[fieldKey];
                state.metaFieldsets[cellKey][fieldKey].value = fieldVal;
            }
        }

        storeState(state);
    } catch (e: any) {
        return new Error("Failed to parse uploaded file. Make sure it is in the same format as a downloaded file.");
    }
}



