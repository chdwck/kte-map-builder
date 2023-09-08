import { Component, For, JSX } from "solid-js";
import { CellStyleKey, cellStyles } from "../webgl-builder/common";
import styles from './CellStyleSelector.module.css';

const cellStyleValues = Object.values(cellStyles);

type CellStyleSelectorProps = {
    onChange: JSX.EventHandler<HTMLSelectElement, Event>;
    value: CellStyleKey;
};
const CellStyleSelector: Component<CellStyleSelectorProps> = (props) => {
    return (
        <div class={styles.container}>
            <div class={styles.colorBox} style={{ background: cellStyles[props.value].color }} />
            <select value={props.value} id="cell-style-selector" onChange={props.onChange} >
                <For each={cellStyleValues}>
                    {(cellStyle) => (
                        <option value={cellStyle.id}>
                            {cellStyle.name}
                        </option>
                    )}
                </For>
            </select>
        </div>
    );
}

export default CellStyleSelector;
