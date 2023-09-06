export function createShader(
    gl: WebGLRenderingContext,
    type: number,
    source: string,
): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        const error = new Error(
            "Failed to create shader: " + gl.getShaderInfoLog(shader),
        );
        gl.deleteShader(shader);
        throw error;
    }

    return shader;
}

