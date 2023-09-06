import commonStyles from "../common.module.css";
import { CellStyleKey, cellStyles } from "../webgl-builder/common";
import styles from './CellStyleButton.module.css';
import { Component, JSX, createMemo } from "solid-js";

type CellStyleButtonProps = {
  cellStyleId: CellStyleKey;
  active: boolean;
  onClick: JSX.EventHandler<HTMLButtonElement, Event>
};

const CellStyleButton: Component<CellStyleButtonProps> = (props) => {
  const cellStyle = createMemo(() => cellStyles[props.cellStyleId]);
  return (
    <button
      class={commonStyles.control}
      style={props.active ? { background: cellStyle().color } : {}}
      onClick={e => props.onClick(e)}
    >
      <span
        class={styles.colorSquare}
        style={{ background: cellStyle().color }}
      />
      <span classList={{ [styles.active]: props.active }}>
        {cellStyle().name} ({cellStyle().id})
      </span>
    </button>
  );
};

export default CellStyleButton;
