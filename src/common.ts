export type CellStyle = {
  id: string;
  name: string;
  color: string;
};

export const nothing: CellStyle = {
  id: "n",
  name: "Nothing",
  color: "blue",
};

export const floor: CellStyle = {
  id: '_',
  name: 'Floor',
  color: '#e3e4db'
}

export const wall: CellStyle = {
  id: "W",
  name: "Wall",
  color: "#342e37",
};

export const enemy: CellStyle = {
  id: "E",
  name: "Enemy",
  color: "#BB0000",
};

export const health: CellStyle = {
  id: "H",
  name: "Health",
  color: "#00B140",
};

export const treasure: CellStyle = {
  id: "T",
  name: "Treasure",
  color: "#FFB319",
};

export const start: CellStyle = {
  id: "S",
  name: "Start",
  color: "pink",
};

export const end: CellStyle = {
  id: "F",
  name: "End",
  color: "purple",
};

export const lore: CellStyle = {
  id: "L",
  name: "Lore",
  color: "yellow",
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
