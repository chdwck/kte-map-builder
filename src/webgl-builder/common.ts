export type Vec2 = [number, number];
export type Vec4 = [number, number, number, number];

export function getXYRanges(range: Vec4) {
    const [xStart, yStart, xEnd, yEnd] = range;
    const minX = Math.min(xStart, xEnd);
    const maxX = Math.max(xStart, xEnd);
    const minY = Math.min(yStart, yEnd);
    const maxY = Math.max(yStart, yEnd);
    return [minX, minY, maxX, maxY];
}

export type Result<T> = [Error] | [undefined, T];

export const WHITE: Vec4 = [255, 255, 255, 1];
export const BLACK: Vec4 = [0, 0, 0, 1];

export type CellStyle = {
    id: string;
    name: string;
    color: string;
    shaderColor: Vec4;
};

export const nothing: CellStyle = {
    id: "n",
    name: "Nothing",
    color: "blue",
    shaderColor: [0, 0, 1, 1]
};

function asVec4(hexStr: string): Vec4 {
    const r = parseInt(hexStr.slice(1, 3), 16) / 255;
    const g = parseInt(hexStr.slice(3, 5), 16) / 255;
    const b = parseInt(hexStr.slice(5, 7), 16) / 255;
    return [r, g, b, 1];
}

const floorColor = '#e3e4db';
export const floor: CellStyle = {
    id: '_',
    name: 'Floor',
    color: floorColor,
    shaderColor: asVec4(floorColor)
}

const wallColor = "#342e37";
export const wall: CellStyle = {
    id: "W",
    name: "Wall",
    color: wallColor,
    shaderColor: asVec4(wallColor)
};

const enemyColor = "#BB0000";
export const enemy: CellStyle = {
    id: "E",
    name: "Enemy",
    color: enemyColor,
    shaderColor: asVec4(enemyColor)
};

const healthColor = "#00B140";
export const health: CellStyle = {
    id: "H",
    name: "Health",
    color: healthColor,
    shaderColor: asVec4(healthColor)
};

const treasureColor = "#FFB319";
export const treasure: CellStyle = {
    id: "T",
    name: "Treasure",
    color: treasureColor,
    shaderColor: asVec4(treasureColor)
};

const startColor = "#ffc0cb";
export const start: CellStyle = {
    id: "S",
    name: "Start",
    color: startColor,
    shaderColor: asVec4(startColor)
};

const endColor = "#4b0082";
export const end: CellStyle = {
    id: "F",
    name: "End",
    color: endColor,
    shaderColor: asVec4(endColor)
};

const loreColor = "#ffff00";
export const lore: CellStyle = {
    id: "L",
    name: "Lore",
    color: loreColor,
    shaderColor: asVec4(loreColor)
};

export const cellStyles = {
    [nothing.id]: nothing,
    [floor.id]: floor,
    [wall.id]: wall,
    [enemy.id]: enemy,
    [health.id]: health,
    [treasure.id]: treasure,
    [start.id]: start,
    [end.id]: end,
    [lore.id]: lore
} as const;

export type CellStyleKey = keyof typeof cellStyles; 
