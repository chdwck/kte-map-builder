import { CellStyle, CellStyleKey, MetaFieldset, Vec2, cellStyles, metaFieldGenerators, nothing } from "./common";
import { clearStoredState, loadStoredState } from "./storage";

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
    const metaFieldset = state.metaFieldsets[cellKey];
    if (!metaFieldset) {
        return;
    }

    const field = metaFieldset[fieldKey];
    if (!field) {
        return;
    }

    field.value = value; 
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
    let matrixStr = "[";
    for (let y = 0; y < state.options.cellCountY; y++) {
        matrixStr += "\n    [";
        for (let x = 0; x < state.options.cellCountX; x++) {
            matrixStr += getCellStyle(state, [x, y]).id;
            if (x !== state.options.cellCountX - 1) {
                matrixStr += ", ";
            }
        }
        matrixStr += "],";
    }
    matrixStr += "\n]";

    const cleanFieldsets: Record<string, Record<string, string>> = {};
    const metaFieldsetKeys = Object.keys(state.metaFieldsets);
    for (let i = 0; i < metaFieldsetKeys.length; i++) {
        const fieldsetKey = metaFieldsetKeys[i];
        const fieldset = state.metaFieldsets[fieldsetKey];
        const fieldKeys = Object.keys(fieldset);
        cleanFieldsets[fieldsetKey] = {}; 
        for (let j = 0; j < fieldKeys.length; j++) {
            const fieldKey = fieldKeys[j];
            cleanFieldsets[fieldsetKey][fieldKey] = state.metaFieldsets[fieldsetKey][fieldKey].value;
        }
    }
    return `{
        matrix: ${matrixStr},
        meta: ${JSON.stringify(cleanFieldsets)}
    }`
}



