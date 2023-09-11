import { For, Component, createMemo, Switch, Match } from "solid-js";
import { CellStyle, FieldType, MetaFieldset as MetaFieldsetT, fieldTypes } from "../webgl-builder/common";

type MetaFieldsetProps = {
    fieldset: MetaFieldsetT;
    cellKey: string;
    cell: CellStyle;
    onChange: (key: keyof MetaFieldsetT, value: string) => void;
};

const MetaFieldset: Component<MetaFieldsetProps> = (props) => {
    const fieldKeys = createMemo(() => Object.keys(props.fieldset));

    function getFieldId(key: string) {
        return props.cellKey + key;
    }

    function getFieldType(key: string): FieldType {
        const field = props.fieldset[key];
        return field.type;
    }

    function getFieldValue(key: string): string {
        const field = props.fieldset[key];
        return field.value;
    }

    function getFieldOptions(key: string): string[] {
        const field = props.fieldset[key];
        return field.options ?? [];
    }

    function handleTextBlur(e: Event, key: string) {
        const target = e.target as HTMLInputElement;
        props.onChange(key, `${target.value}`)
    }

    return (
        <fieldset>
            <legend>{props.cell.name} - {props.cellKey}</legend>
            <For each={fieldKeys()}>
                {key => (
                    <div>
                        <label for={getFieldId(key)}>{key}</label>
                        <Switch>
                            <Match when={getFieldType(key) === fieldTypes.text}>
                                <input
                                    id={getFieldId(key)}
                                    type="text"
                                    value={getFieldValue(key)}
                                    onBlur={e => handleTextBlur(e, key)}
                                />
                            </Match>
                            <Match when={getFieldType(key) === fieldTypes.number}>
                                <input
                                    id={getFieldId(key)}
                                    type="number"
                                    min={1}
                                    value={parseInt(getFieldValue(key))}
                                    onBlur={e => handleTextBlur(e, key)}
                                />
                            </Match>
                            <Match when={getFieldType(key) === fieldTypes.select}>
                                <select
                                    id={getFieldId(key)}
                                    value={getFieldValue(key)}
                                    onSelect={e => handleTextBlur(e, key)}
                                >
                                    <For each={getFieldOptions(key)}>
                                        {optionVal => (
                                            <option value={optionVal}>{optionVal}</option>
                                        )}
                                    </For>
                                </select>
                            </Match>
                        </Switch>
                    </div>
                )}
            </For>
        </fieldset>
    );
}

export default MetaFieldset;
