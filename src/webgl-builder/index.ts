import { BLACK, Vec2, Vec4, WHITE, getXYRanges } from "./common";
import { createShader } from "./helpers";
import { pixelSpace_vertexShaderSrc, rgbInput_fragmentShaderSrc } from "./shaders";
import { MapBuilderState, canvasHeightPx, canvasWidthPx, getCellStyle } from "./state";

// set temp state on window
declare global {
    // eslint-disable-next-line no-unused-vars
    interface Window {
        __kteRafCancel: boolean;
        __kteGl: WebGLRenderingContext;
        __kteUniforms: {
            cellSize: WebGLUniformLocation;
            color: WebGLUniformLocation;
            borderColor: WebGLUniformLocation;
        },
        __kteDragCoords?: Vec4;
    }
}

export function isCellInDragArea(pos: Vec2): boolean {
    if (!window.__kteDragCoords) {
        return false;
    }
    const [startX, startY, endX, endY] = getXYRanges(window.__kteDragCoords)
    const [x, y] = pos;

    return startX <= x && x <= endX && startY <= y && y <= endY;
}

export function initBuilder(state: MapBuilderState, canvas: HTMLCanvasElement) {
    canvas.width = canvasWidthPx(state);
    canvas.height = canvasHeightPx(state);

    const gl = canvas.getContext("webgl");
    if (!gl) {
        throw new Error("WebGL could not be initialized.");
    }

    const vertexShader = createShader(
        gl, gl.VERTEX_SHADER, pixelSpace_vertexShaderSrc);
    const fragmentShader = createShader(
        gl, gl.FRAGMENT_SHADER, rgbInput_fragmentShaderSrc);

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) {
        const error = new Error(
            "Failed to create program: " + gl.getProgramInfoLog(program),
        );
        gl.deleteProgram(program);
        throw error;
    }

    const positionAttributeLocation =
        gl.getAttribLocation(program, "a_position");
    const resolutionUniformPosition = gl.getUniformLocation(
        program,
        "u_resolution",
    );

    const positionBuffer = gl.createBuffer();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const size = 2; // 2 components per iteration - x, y
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(
        positionAttributeLocation,
        size,
        type,
        normalize,
        stride,
        offset,
    );

    gl.uniform2f(resolutionUniformPosition, canvas.width, canvas.height);

    window.__kteUniforms = {
        color: gl.getUniformLocation(program, "u_color",)!,
        cellSize: gl.getUniformLocation(program, "u_cell_size")!,
        borderColor: gl.getUniformLocation(program, "u_border_color")!
    };

    gl.uniform1f(window.__kteUniforms.cellSize, state.options.cellSize);
    window.__kteGl = gl;
    window.__kteRafCancel = true;
    requestAnimationFrame(() => {
        window.__kteRafCancel = false;
        raf(state);
    })
}

export function updateDragCoords(state: MapBuilderState, start?: Vec2, end?: Vec2) {
    // start only
    if (start && !end) {
        const startX = Math.floor(start[0] / state.options.cellSize);
        const startY = Math.floor(start[1] / state.options.cellSize);
        window.__kteDragCoords = [startX, startY, startX, startY];
        return;
    }

    // end only
    if (end && window.__kteDragCoords) {
        const endX = Math.floor(end[0] / state.options.cellSize);
        const endY = Math.floor(end[1] / state.options.cellSize);
        window.__kteDragCoords[2] = endX;
        window.__kteDragCoords[3] = endY;
        return;
    }

    window.__kteDragCoords = undefined;
}


function render(state: MapBuilderState) {
    for (let y = 0; y < state.options.cellCountY; y++) {
        for (let x = 0; x < state.options.cellCountX; x++) {
            drawCell(state, [x, y]);
        }
    }
}

export function raf(state: MapBuilderState) {
    requestAnimationFrame(() => {
        render(state);
        if (!window.__kteRafCancel) {
            raf(state);
        }
    });
}

function drawCell(state: MapBuilderState, pos: Vec2) {
    const x = pos[0] * state.options.cellSize;
    const y = pos[1] * state.options.cellSize;
    const x1 = x + state.options.cellSize;
    const y1 = y + state.options.cellSize;

    window.__kteGl.bufferData(
        window.__kteGl.ARRAY_BUFFER,
        new Float32Array([
            x, y,
            x, y1,
            x1, y,
            x1, y,
            x, y1,
            x1, y1
        ]),
        window.__kteGl.STATIC_DRAW
    );

    const cellStyle = getCellStyle(state, pos);
    const borderColor = isCellInDragArea(pos)
        ? WHITE
        : BLACK;

    window.__kteGl.uniform4fv(window.__kteUniforms.color, cellStyle.shaderColor);
    window.__kteGl.uniform4fv(window.__kteUniforms.borderColor, borderColor);
    window.__kteGl.drawArrays(window.__kteGl.TRIANGLES, 0, 6);
}

