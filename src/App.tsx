import {
  createSignal,
  type Component,
  createMemo,
  For,
  createSelector,
  createEffect,
  onMount,
} from "solid-js";

import styles from "./App.module.css";
import NumberInput from "./components/NumberInput";
import { nothing, cellStyles } from "./common";
import CellStyleButton from "./components/CellStyleButton";

const localStorageKey = "2darray";

type Vec2 = [number, number];
type Vec4 = [number, number, number, number];

const App: Component = () => {
  const [isMounted, setIsMounted] = createSignal(false);
  const [mapHeight, setMapHeight] = createSignal(10);
  const [mapWidth, setMapWidth] = createSignal(10);
  const [cellSize, setCellSize] = createSignal(40);
  const [cellStyleMap, setCellStyleMap] = createSignal<Record<string, string>>(
    {},
  );
  const [lastSaved, setLastSaved] = createSignal(Date.now());
  const lastSavedFmt = createMemo(() => new Date(lastSaved()).toLocaleString());

  const [selected, setSelected] = createSignal(nothing.id);
  const isSelected = createSelector(selected);

  const [dragVertices, setDragVertices] = createSignal<Vec4>([-1, -1, -1, -1]);
  const isInDragArea = createSelector<Vec4, Vec2>(
    dragVertices,
    (value, compare) => {
      const [x, y] = value;
      const [xStart, yStart, xEnd, yEnd] = compare;
      return xStart <= x && x <= xEnd && yStart <= y && y <= yEnd;
    },
  );

  const matrix = createMemo<number[][]>(() => {
    const _matrix: number[][] = [];
    for (let y = 0; y < mapHeight(); y++) {
      _matrix.push([]);
      for (let x = 0; x < mapWidth(); x++) {
        _matrix[y].push(0);
      }
    }
    return _matrix;
  });

  onMount(() => {
    updateStateFromSaved();
    setIsMounted(true);
  });

  createEffect(() => {
    if (!isMounted()) {
      return;
    }
    const matrixStr = JSON.stringify(buildHydratedMatrix());
    localStorage.setItem(localStorageKey, matrixStr);
    setLastSaved(Date.now());
  });

  function buildHydratedMatrix(): string[][] {
    const _matrix: string[][] = [];
    const _mapHeight = mapHeight();
    const _mapWidth = mapWidth();
    const _cellStyleMap = cellStyleMap();
    for (let y = 0; y < _mapHeight; y++) {
      _matrix.push([]);
      for (let x = 0; x < _mapWidth; x++) {
        const cellStyleId = _cellStyleMap[getCellStyleKey(x, y)] ?? nothing.id;
        _matrix[y].push(cellStyleId);
      }
    }
    return _matrix;
  }

  function updateStateFromSaved() {
    const stringifiedMatrix = localStorage.getItem(localStorageKey);
    console.log(stringifiedMatrix);
    if (!stringifiedMatrix) {
      setSelected(nothing.id);
      setDragVertices([-1, -1, -1, -1]);
      setMapHeight(10);
      setMapWidth(10);
      setCellStyleMap({});
      return;
    }

    try {
      const parsed = JSON.parse(stringifiedMatrix) as string[][];
      setMapHeight(parsed.length);
      setMapWidth(parsed[0].length);
      const nextCellMap: Record<string, string> = {};

      for (let y = 0; y < parsed.length; y++) {
        for (let x = 0; x < parsed[0].length; x++) {
          const cellId = parsed[y][x];
          if (cellId !== nothing.id) {
            nextCellMap[getCellStyleKey(x, y)] = cellId;
          }
        }
      }

      setCellStyleMap(nextCellMap);
    } catch {
      clearSavedData();
    }
  }

  function getCellStyleKey(x: number, y: number) {
    return `${x}_${y}`;
  }

  function updateWidth(e: Event) {
    const target = e.target as HTMLInputElement;
    setMapWidth(parseInt(target.value));
  }

  function updateHeight(e: Event) {
    const target = e.target as HTMLInputElement;
    setMapHeight(parseInt(target.value));
  }

  function updateCellSize(e: Event) {
    const target = e.target as HTMLInputElement;
    setCellSize(parseInt(target.value));
  }

  function getXY(e: Event): Vec2 | undefined {
    const target = e.target as HTMLDivElement;
    const x = target.dataset.x;
    const y = target.dataset.y;
    if (!x || !y) {
      return undefined;
    }
    return [parseInt(x), parseInt(y)];
  }

  function updateCellStyle(e: Event) {
    const xy = getXY(e);
    if (!xy) {
      return;
    }
    const [x, y] = xy;
    e.preventDefault();
    setCellStyleMap((prev) => {
      const _selected = selected();
      const key = getCellStyleKey(x, y);
      prev[key] = _selected;
      return prev;
    });
  }

  function handleDragStart(e: Event) {
    const xy = getXY(e);
    if (!xy) {
      return;
    }
    e.preventDefault();
    const [x, y] = xy;
    const pos: Vec2 = [x, y];
    setDragVertices([...pos, ...pos]);
  }

  function handleDragProgress(e: Event) {
    const xy = getXY(e);
    if (!xy) {
      return;
    }
    e.preventDefault();
    const [x, y] = xy;
    if (dragVertices().some((vCmpnt) => vCmpnt > -1)) {
      setDragVertices((prev) => [...prev.slice(0, 2), x, y] as Vec4);
    }
  }

  function handleDragEnd(e: Event) {
    const xy = getXY(e);
    if (!xy) {
      return;
    }
    const [xEnd, yEnd] = xy;
    e.preventDefault();
    const _dragVertices = dragVertices();
    const [xStart, yStart] = _dragVertices;

    const _selected = selected();
    setCellStyleMap((prev) => {
      const next = { ...prev };
      for (let y = yStart; y <= yEnd; y++) {
        for (let x = xStart; x <= xEnd; x++) {
          next[getCellStyleKey(x, y)] = _selected;
        }
      }

      return next;
    });

    setDragVertices([-1, -1, -1, -1]);
  }

  function getCellId(x: number, y: number) {
    const key = getCellStyleKey(x, y);
    const cellId = cellStyleMap()[key];
    return cellId ?? nothing.id;
  }

  function clearSavedData() {
    localStorage.removeItem(localStorageKey);
    updateStateFromSaved();
  }

  function copyDataToClipboard() {
    let str = "[";
    const height = mapHeight();
    const width = mapWidth();
    for (let y = 0; y < height; y++) {
      str += "\n    [";
      for (let x = 0; x < width; x++) {
        str += getCellId(x, y);
        if (x !== width - 1) {
          str += ", ";
        }
      }
      str += "],";
    }
    str += "\n]";

    navigator.clipboard
      .writeText(str)
      .then(() => {
        // Alert the user that the action took place.
        // Nobody likes hidden stuff being done under the hood!
        alert("Copied to clipboard");
      })
      .catch(() => {
        alert("Failed to Copy to clipboard");
      });
  }

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <h1>2D Array Builder</h1>
      </header>

      <main class={styles.main}>
        <section class={styles.controls}>
          <p>
            Last saved at <time>{lastSavedFmt()}</time>
          </p>
          <button onClick={clearSavedData}>Clear Data</button>
          <button onClick={copyDataToClipboard}>Copy Array to Clipboard</button>
        </section>
        <section>
          <h2>Dimensions</h2>
          <div class={styles.controls}>
            <NumberInput
              value={mapWidth()}
              label="Width"
              onChange={updateWidth}
            />
            <NumberInput
              value={mapHeight()}
              label="Height"
              onChange={updateHeight}
            />
            <NumberInput
              value={cellSize()}
              label="Cell Size"
              onChange={updateCellSize}
            />
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

        <table
          onClick={updateCellStyle}
          onMouseDown={handleDragStart}
          onMouseOver={handleDragProgress}
          onMouseUp={handleDragEnd}
        >
          <For each={matrix()} fallback={<p>Loading</p>}>
            {(row, y) => (
              <tr class={styles.row}>
                <For each={row}>
                  {(_, x) => (
                    <td
                      data-x={x()}
                      data-y={y()}
                      style={{
                        width: `${cellSize()}px`,
                        height: `${cellSize()}px`,
                        background: cellStyles[getCellId(x(), y())].color,
                      }}
                      classList={{
                        [styles.cell]: true,
                        [styles.inDragArea]: isInDragArea([x(), y()]),
                      }}
                    >
                      <span>{getCellId(x(), y())}</span>
                    </td>
                  )}
                </For>
              </tr>
            )}
          </For>
        </table>
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
