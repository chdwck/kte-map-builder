import {
    createSignal,
    Component,
    For,
    createSelector,
    onMount,
} from "solid-js";

import styles from "./App.module.css";
import NumberInput from "./components/NumberInput";
import {
    nothing,
    cellStyles,
    Vec2,
    Result,
    CellStyleKey
} from "./webgl-builder/common";
import CellStyleButton from "./components/CellStyleButton";
import { initBuilder, updateArea, updateDragCoords, updateOption } from "./webgl-builder";
import { initState } from "./webgl-builder/state";
import CellStyleSelector from "./components/CellStyleSelector";

const App: Component = () => {
    let canvasRef: HTMLCanvasElement | null = null;
    const state = initState();
    const [width, setWidth] = createSignal(state.options.cellCountX);
    const [height, setHeight] = createSignal(state.options.cellCountY);
    const [cellSize, setCellSize] = createSignal(state.options.cellSize);
    const [selected, setSelected] = createSignal<CellStyleKey>(nothing.id);

    onMount(() => {
        if (canvasRef !== null) {
            initBuilder(state, canvasRef);
        }

        window.addEventListener("mousedown", handleDown);
        window.addEventListener("mouseup", handleUp);
        window.addEventListener("touchstart", handleDown);
        window.addEventListener("touchend", handleUp);
        window.addEventListener("mousemove", handleMove);
        window.addEventListener("touchmove", handleMove);
    });

    function refresh() {
        initBuilder(state, canvasRef!);
    }

    function getRelativeXY(e: MouseEvent | TouchEvent): Result<Vec2> {
        if (!canvasRef) {
            return [new Error("Canvas element not in DOM")];
        }

        const rect = canvasRef.getBoundingClientRect();
        let x = -1;
        let y = -1;
        if (e instanceof MouseEvent) {
            x = e.clientX - rect.x;
            y = e.clientY - rect.y;
        } else {
            x = e.touches[0].clientX - rect.x;
            y = e.touches[0].clientY - rect.y;
        }

        if (x < 0 || y < 0) {
            return [new Error("Not on canvas")]
        }

        return [undefined, [x, y]];
    }

    function handleDown(e: MouseEvent | TouchEvent) {
        const [error, xy] = getRelativeXY(e);
        if (error) {
            return;
        }

        e.preventDefault();

        updateDragCoords(state, xy)
    }

    function handleMove(e: MouseEvent | TouchEvent) {
        const [error, xy] = getRelativeXY(e);
        if (error) {
            updateDragCoords(state)
            return;
        }
        e.preventDefault();
        updateDragCoords(state, undefined, xy)
    }

    function handleUp() {
        updateArea(state, selected());
        updateDragCoords(state)
    }

    function updateWidth(e: Event) {
        const target = e.target as HTMLInputElement;
        const value = parseInt(target.value);
        updateOption(state, 'cellCountX', value)
        setWidth(value)
    }

    function updateHeight(e: Event) {
        const target = e.target as HTMLInputElement;
        const value = parseInt(target.value);
        updateOption(state, 'cellCountY', value)
        setHeight(value)
    }

    function updateCellSize(e: Event) {
        const target = e.target as HTMLInputElement;
        const value = parseInt(target.value);
        updateOption(state, 'cellSize', value)
        setCellSize(value)
    }

    function updateSelected(e: Event) {
        const target = e.target as HTMLSelectElement;
        
        setSelected(target.value);
    }

    return (
        <div class={styles.App}>
            <header class={styles.header}>
                <h1>Kill the Evil Map Builder</h1>
                <div class={styles.controls}>
                <CellStyleSelector value={selected()} onChange={updateSelected} />
                    <NumberInput value={width()} label="Width" onBlur={refresh} onChange={updateWidth} />
                    <NumberInput value={height()} label="Height" onBlur={refresh} onChange={updateHeight} />
                    <NumberInput value={cellSize()} label="Cell Size" onBlur={refresh} onChange={updateCellSize} />
                </div>
            </header>

            <main class={styles.main}>
                <canvas ref={ref => canvasRef = ref} />
            </main>
        </div>
    );
};

export default App;
