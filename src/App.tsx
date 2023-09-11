import {
    createSignal,
    Component,
    onMount,
    createMemo,
    For,
} from "solid-js";

import styles from "./App.module.css";
import NumberInput from "./components/NumberInput";
import {
    nothing,
    Vec2,
    Result,
    CellStyleKey,
    cellStyles
} from "./webgl-builder/common";
import { initBuilder, updateArea, updateDragCoords, updateOption } from "./webgl-builder";
import { MetaFieldset as MetaFieldsetT, initState, stringifyState, updateMetaFieldSet } from "./webgl-builder/state";
import CellStyleSelector from "./components/CellStyleSelector";
import MetaFieldset from "./components/MetaFieldset";

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
    const [stringState, setStringState] = createSignal('');
    const [isEditing, setIsEditing] = createSignal(true);
    const [isMobile, setIsMobile] = createSignal(isMobileWidth());
    const [isSidebarOpen, setIsSidebarOpen] = createSignal(false);
    const [metaFieldsets, setMetaFieldsets] = createSignal<Record<string, MetaFieldsetT>>({});

    const editModeText = createMemo(() => !isEditing() ? 'Scrolling' : 'Editing');
    const metaFieldsetKeys = createMemo(() => Object.keys(metaFieldsets()));

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

        const isMouseEvent = Object.hasOwn(e, 'clientX');
        if (isMouseEvent) {
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
        updateDragCoords(state);
        setMetaFieldsets({ ...state.metaFieldsets });
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
        setStringState(stringifyState(state));
        setTimeout(() => {
            if (textareaRef) {
                textareaRef.select();
            }
        }, 0)
    }

    function toggleEditMode() {
        setIsEditing(!isEditing());
    }

    function toggleSidebar() {
        setIsSidebarOpen(!isSidebarOpen());
    }

    function handleMetaFieldsetChange(
        cellKey: string,
        fieldKey: keyof MetaFieldsetT, 
        value: string
        ) {
        updateMetaFieldSet(state, cellKey, fieldKey, value);
        setMetaFieldsets({ ...state.metaFieldsets });
    }

    return (
        <div class={styles.App}>
            <header class={styles.header}>
                <h1>Kill the Evil Map Builder</h1>
                <button onClick={toggleSidebar} class={styles.hamburger}>🍔</button>
            </header>

            <aside class={styles.sidebar} classList={{ [styles.open]: isSidebarOpen() }}>
                <div>
                    {isMobile() && <button onClick={toggleEditMode}>{editModeText()}</button>}
                    <CellStyleSelector value={selected()} onChange={updateSelected} />
                    <NumberInput value={width()} label="Width" onBlur={refresh} onChange={updateWidth} />
                    <NumberInput value={height()} label="Height" onBlur={refresh} onChange={updateHeight} />
                    <NumberInput value={cellSize()} label="Cell Size" onBlur={refresh} onChange={updateCellSize} />
                    <div>
                        <h2>Copy Map Data</h2>
                        <textarea
                            ref={ref => textareaRef = ref}
                            onChange={e => e.preventDefault()}
                            onFocus={e => e.preventDefault()}
                            onClick={selectText}
                        >
                            {stringState()}
                        </textarea>
                    </div>
                    <div class={styles.meta}>
                        <h2>Meta</h2>
                        <For each={metaFieldsetKeys()}>
                            {(cellKey: string) => (
                                <MetaFieldset
                                    cell={cellStyles[state.cellMap[cellKey]]} 
                                    fieldset={state.metaFieldsets[cellKey]} 
                                    onChange={(fieldKey, value) => handleMetaFieldsetChange(cellKey, fieldKey, value)}
                                    cellKey={cellKey} 
                                />)
                            }
                        </For>
                    </div>
                </div>
            </aside>

            <main class={styles.main} style={{ overflow: isEditing() && isMobile() ? 'hidden' : 'scroll' }}>
                <canvas ref={ref => canvasRef = ref} />
            </main>
        </div>
    );
};

export default App;
