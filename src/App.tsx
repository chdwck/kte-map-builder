import {
    createSignal,
    Component,
    onMount,
    createMemo,
    createEffect
} from "solid-js";

import styles from "./App.module.css";
import NumberInput from "./components/NumberInput";
import {
    nothing,
    Vec2,
    Result,
    CellStyleKey
} from "./webgl-builder/common";
import { initBuilder, updateArea, updateDragCoords, updateOption } from "./webgl-builder";
import { initState, stringifyMatrix } from "./webgl-builder/state";
import CellStyleSelector from "./components/CellStyleSelector";

function isMobileWidth() {
    return window.innerWidth <= 960;
}

const App: Component = () => {
    let canvasRef: HTMLCanvasElement | null = null;
    let textareaRef: HTMLTextAreaElement | null = null;
    const state = initState();
    const [width, setWidth] = createSignal(state.options.cellCountX);
    const [height, setHeight] = createSignal(state.options.cellCountY);
    const [cellSize, setCellSize] = createSignal(state.options.cellSize);
    const [selected, setSelected] = createSignal<CellStyleKey>(nothing.id);
    const [showArray, setShowArray] = createSignal(false);
    const [stringMatrix, setStringMatrix] = createSignal('');
    const [isEditing, setIsEditing] = createSignal(true);
    const [isMobile, setIsMobile] = createSignal(isMobileWidth());

    const editModeEmoji = createMemo(() => !isEditing() ? 'Scrolling' : 'Editing');

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

        window.addEventListener("resize", handleResize)
    });

    function handleResize() {
        setIsMobile(isMobileWidth())
    }

    function refresh() {
        initBuilder(state, canvasRef!);
    }

    function getRelativeXY(e: MouseEvent | TouchEvent): Result<Vec2> {
        if (!isEditing() && isMobile()) {
            return [new Error("Not in edit mode")];
        }
        if (!canvasRef) {
            return [new Error("Canvas element not in DOM")];
        }

        if (e.target !== canvasRef) {
            return [new Error("Not on canvas")];
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

        if (Object.hasOwn(e, 'clientX')) {
            e.preventDefault();
        }

        updateDragCoords(state, xy)
    }

    function handleMove(e: MouseEvent | TouchEvent) {
        const [error, xy] = getRelativeXY(e);
        if (error) {
            updateDragCoords(state)
            return;
        }
        if (Object.hasOwn(e, 'clientX')) {
            e.preventDefault();
        }
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

    function selectText() {
        if (textareaRef) {
            textareaRef.select();
        }
    }

    function toggleCodeView() {
        const next = !showArray();
        if (next) {
            setStringMatrix(stringifyMatrix(state));
            setTimeout(() => {
                selectText();
            }, 0)
        }
        setShowArray(next)
    }

    function toggleEditMode() {
        setIsEditing(!isEditing());
    }

    return (
        <div class={styles.App}>
            <header class={styles.header}>
                <h1>Kill the Evil Map Builder</h1>
                <div class={styles.controls}>
                    {isMobile() && <button onClick={toggleEditMode}>{editModeEmoji()}</button>}
                    <button onClick={toggleCodeView}>Copy Data View</button>
                    <CellStyleSelector value={selected()} onChange={updateSelected} />
                    <NumberInput value={width()} label="W" onBlur={refresh} onChange={updateWidth} />
                    <NumberInput value={height()} label="H" onBlur={refresh} onChange={updateHeight} />
                    <NumberInput value={cellSize()} label="Cell Size" onBlur={refresh} onChange={updateCellSize} />
                </div>
            </header>

            <main class={styles.main} style={{ overflow: isEditing() && isMobile() ? 'hidden' : 'scroll' }}>
                <dialog open={showArray()} class={styles.dialog}>
                    <div>
                        <h2>Copy Map Data</h2>
                        <textarea
                            ref={ref => textareaRef = ref}
                            onChange={e => e.preventDefault()}
                            onFocus={e => e.preventDefault()}
                            onClick={selectText}
                        >
                            {stringMatrix()}
                        </textarea>
                        <button onClick={toggleCodeView}>Close</button>
                    </div>
                </dialog>
                <canvas ref={ref => canvasRef = ref} />
            </main>
        </div>
    );
};

export default App;
