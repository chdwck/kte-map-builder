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

const App: Component = () => {
    let canvasRef: HTMLCanvasElement | null = null;
    const state = initState();
    const [width, setWidth] = createSignal(state.options.cellCountX);
    const [height, setHeight] = createSignal(state.options.cellCountY);
    const [cellSize, setCellSize] = createSignal(state.options.cellSize);
    const [selected, setSelected] = createSignal<CellStyleKey>(nothing.id);

    const isSelected = createSelector(selected);

    onMount(() => {
        if (canvasRef !== null) {
            initBuilder(state, canvasRef);
        }

        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("touchstart", handleTouchStart);
        window.addEventListener("touchend", handleTouchEnd);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove);
    });

    function refresh() {
        initBuilder(state, canvasRef!);
    }

    function getRelativeXY(e: MouseEvent): Result<Vec2> {
        if (!canvasRef) {
            return [new Error("Canvas element not in DOM")];
        }

        const rect = canvasRef.getBoundingClientRect();
        const x = e.clientX - rect.x;
        const y = e.clientY - rect.y;

        if (x < 0 || y < 0) {
            return [new Error("Not on canvas")]
        }

        return [undefined, [x, y]];
    }

    function handleMouseDown(e: MouseEvent) {
        const [error, xy] = getRelativeXY(e);
        if (error) {
            return;
        }

        e.preventDefault();

        updateDragCoords(state, xy)
    }

    function handleMouseMove(e: MouseEvent) {
        const [error, xy] = getRelativeXY(e);
        if (error) {
            updateDragCoords(state)
            return;
        }
        e.preventDefault();
        updateDragCoords(state, undefined, xy)
    }

    function handleMouseUp() {
        updateArea(state, selected());
        updateDragCoords(state)
    }

    function handleTouchStart(e: TouchEvent) {
    }

    function handleTouchEnd(e: TouchEvent) {
        console.log("tend", e)
    }

    function handleTouchMove(e: TouchEvent) {
        console.log("tmove", e)
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

    return (
        <div class={styles.App}>
            <header class={styles.header}>
                <h1>Kill the Evil Map Builder</h1>
            </header>

            <main class={styles.main}>
                <section>
                    <h2>Dimensions</h2>
                    <div class={styles.controls}>
                        <NumberInput value={width()} label="Width" onBlur={refresh} onChange={updateWidth} />
                        <NumberInput value={height()} label="Height" onBlur={refresh} onChange={updateHeight} />
                        <NumberInput value={cellSize()} label="Cell Size" onBlur={refresh} onChange={updateCellSize} />
                    </div>
                </section>

                <br />

                <section>
                    <h2>Cell Styles</h2>
                    <div class={styles.controls}>
                        <For each={Object.keys(cellStyles)}>
                            {(cellStyleId) => (
                                <CellStyleButton
                                    active={isSelected(cellStyleId)}
                                    cellStyleId={cellStyleId}
                                    onClick={() => setSelected(cellStyleId)}
                                />
                            )}
                        </For>
                    </div>
                </section>
                <br />
                <canvas ref={ref => canvasRef = ref} />
            </main>

            <footer class={styles.footer}>
                <span>
                    Built by <a href="https://github.com/chdwck">@chdwck</a>
                </span>
                <span>
                    Read my blog @{" "}
                    <a href="https://www.wicksworld.dev">www.wicksworld.dev</a>
                </span>
            </footer>
        </div>
    );
};

export default App;
