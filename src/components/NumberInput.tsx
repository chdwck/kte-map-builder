import { Component, JSX, createUniqueId } from "solid-js";
import commonStyles from '../common.module.css';

type NumberInputProps = {
    label: string;
    value: number;
    onBlur: JSX.EventHandler<HTMLInputElement, Event>;
    onChange: JSX.EventHandler<HTMLInputElement, Event>;
};

const NumberInput: Component<NumberInputProps> = (props) => {
    const id = createUniqueId();
    return (
        <span class={commonStyles.control}>
            <label for={id}>{props.label}</label>
            <input
                id={id}
                value={props.value}
                type="number"
                min={0}
                max={1000}
                onBlur={(e) => props.onBlur(e)}
                onChange={(e) => props.onChange(e)}
            />
        </span>
    );
};

export default NumberInput;
