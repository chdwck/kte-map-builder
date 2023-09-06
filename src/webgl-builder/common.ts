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

export const floor: CellStyle = {
    id: '_',
    name: 'Floor',
    color: '#e3e4db',
    shaderColor: [227 / 255, 228 / 255, 219 / 255, 1]
}

// export const wall: CellStyle = {
//   id: "W",
//   name: "Wall",
//   color: "#342e37",
// };
//
// export const enemy: CellStyle = {
//   id: "E",
//   name: "Enemy",
//   color: "#BB0000",
// };
//
// export const health: CellStyle = {
//   id: "H",
//   name: "Health",
//   color: "#00B140",
// };
//
// export const treasure: CellStyle = {
//   id: "T",
//   name: "Treasure",
//   color: "#FFB319",
// };
//
// export const start: CellStyle = {
//   id: "S",
//   name: "Start",
//   color: "pink",
// };
//
// export const end: CellStyle = {
//   id: "F",
//   name: "End",
//   color: "purple",
// };
//
// export const lore: CellStyle = {
//   id: "L",
//   name: "Lore",
//   color: "yellow",
// };

export const cellStyles = {
    [nothing.id]: nothing,
    [floor.id]: floor,
    // [wall.id]: wall,
    // [enemy.id]: enemy,
    // [health.id]: health,
    // [treasure.id]: treasure,
    // [start.id]: start,
    // [end.id]: end,
    // [lore.id]: lore
} as const;

export type CellStyleKey = keyof typeof cellStyles; 
