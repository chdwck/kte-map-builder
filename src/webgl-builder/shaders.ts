export const rgbInput_fragmentShaderSrc = `
    precision mediump float;
    
    uniform vec4 u_color;
    uniform float u_cell_size;
    uniform vec4 u_border_color;

    void main() {
        float border_width = 1.0;
        float x = mod(gl_FragCoord.x, u_cell_size);
        float y = mod(gl_FragCoord.y, u_cell_size);
        if (
            x > border_width && 
            x < u_cell_size - border_width &&
            y > border_width &&
            y < u_cell_size - border_width
        ) {
           gl_FragColor = u_color; 
        } else {
            gl_FragColor = u_border_color;
        }
    }
`;

export const pixelSpace_vertexShaderSrc = `
    precision mediump float;
    attribute vec2 a_position;
    uniform vec2 u_resolution;

    void main() {
      vec2 zeroToOne = a_position / u_resolution;
      vec2 zeroToTwo = zeroToOne * 2.0;
      vec2 clipSpace = zeroToTwo - 1.0;
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    }
`;

