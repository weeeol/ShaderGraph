const VERTEX_SHADER_SRC = "#version 300 es\n" +
"in vec2 a_position;\n" +
"out vec2 v_uv;\n" +
"void main() {\n" +
"    v_uv = a_position * 0.5 + 0.5;\n" +
"    gl_Position = vec4(a_position, 0.0, 1.0);\n" +
"}\n";

export interface CompileResult {
  success: boolean;
  error?: string;
  line?: number;
}

export class ShaderRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private vertexBuffer: WebGLBuffer | null = null;
  
  // Uniform locations
  private uTimeLoc: WebGLUniformLocation | null = null;
  private uResolutionLoc: WebGLUniformLocation | null = null;
  private uMouseLoc: WebGLUniformLocation | null = null;
  private uFrameLoc: WebGLUniformLocation | null = null;

  private frame = 0;
  private vertexShader: WebGLShader | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false });
    if (!gl) {
      throw new Error('WebGL2 not supported');
    }
    this.gl = gl;
    this.initQuad();
    this.vertexShader = this.compileShader(this.gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
  }

  private initQuad() {
    const gl = this.gl;
    const positions = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
      -1.0,  1.0,
       1.0, -1.0,
       1.0,  1.0,
    ]);

    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    
    // Position attribute will be bound to location 0
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    const gl = this.gl;
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(info || 'Unknown shader compile error');
    }

    return shader;
  }

  public updateShader(fragmentSource: string): CompileResult {
    const gl = this.gl;
    
    try {
      const fragShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);
      if (!fragShader || !this.vertexShader) {
        return { success: false, error: 'Failed to create shader objects.' };
      }

      const program = gl.createProgram();
      if (!program) return { success: false, error: 'Failed to create program.' };

      // Bind attribute 0 to a_position before linking
      gl.bindAttribLocation(program, 0, 'a_position');
      
      gl.attachShader(program, this.vertexShader);
      gl.attachShader(program, fragShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        gl.deleteShader(fragShader);
        return { success: false, error: info || 'Unknown link error.' };
      }

      // Cleanup old program
      if (this.program) {
        gl.deleteProgram(this.program);
      }
      
      // Cleanup frag shader (no longer needed after link)
      gl.deleteShader(fragShader);

      this.program = program;
      
      // Cache uniform locations
      this.uTimeLoc = gl.getUniformLocation(program, 'u_time');
      this.uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
      this.uMouseLoc = gl.getUniformLocation(program, 'u_mouse');
      this.uFrameLoc = gl.getUniformLocation(program, 'u_frame');
      
      this.frame = 0; // Reset frame count on new shader

      return { success: true };

    } catch (e: any) {
      // Parse error log for line numbers
      const errStr = String(e.message || e);
      let line = 0;
      // Standard WebGL infoLog format often includes "ERROR: 0:line:"
      const match = errStr.match(/ERROR:\s*\d+:(\d+):/);
      if (match && match[1]) {
        line = parseInt(match[1], 10);
      }
      return { success: false, error: errStr, line };
    }
  }

  public render(time: number, mouseX: number, mouseY: number, width: number, height: number) {
    if (!this.program || !this.vao) return;
    
    const gl = this.gl;
    
    // Ensure canvas is right size
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);

    if (this.uTimeLoc) gl.uniform1f(this.uTimeLoc, time);
    if (this.uResolutionLoc) gl.uniform2f(this.uResolutionLoc, gl.drawingBufferWidth, gl.drawingBufferHeight);
    if (this.uMouseLoc) gl.uniform2f(this.uMouseLoc, mouseX, mouseY);
    if (this.uFrameLoc) gl.uniform1i(this.uFrameLoc, this.frame);

    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);

    this.frame++;
  }

  public bakeTexture(resolution: number): string {
    if (!this.program || !this.vao) return '';
    const gl = this.gl;

    // Create FBO
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, resolution, resolution, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);

    gl.viewport(0, 0, resolution, resolution);
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.program);
    if (this.uTimeLoc) gl.uniform1f(this.uTimeLoc, 0); // Bake at t=0
    if (this.uResolutionLoc) gl.uniform2f(this.uResolutionLoc, resolution, resolution);
    if (this.uMouseLoc) gl.uniform2f(this.uMouseLoc, 0.5, 0.5);
    if (this.uFrameLoc) gl.uniform1i(this.uFrameLoc, 0);

    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    
    // Read pixels
    const data = new Uint8Array(resolution * resolution * 4);
    gl.readPixels(0, 0, resolution, resolution, gl.RGBA, gl.UNSIGNED_BYTE, data);

    // Cleanup
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteTexture(tex);
    gl.deleteFramebuffer(fb);

    // Write to temporary 2d canvas to get data URI
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = resolution;
    tempCanvas.height = resolution;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      // Create ImageData. WebGL reads pixels bottom-up, so we need to flip it
      const imageData = ctx.createImageData(resolution, resolution);
      // Flip Y axis
      for (let y = 0; y < resolution; y++) {
        for (let x = 0; x < resolution; x++) {
          const srcIdx = (y * resolution + x) * 4;
          const destIdx = ((resolution - 1 - y) * resolution + x) * 4;
          imageData.data[destIdx] = data[srcIdx];
          imageData.data[destIdx + 1] = data[srcIdx + 1];
          imageData.data[destIdx + 2] = data[srcIdx + 2];
          imageData.data[destIdx + 3] = data[srcIdx + 3];
        }
      }
      ctx.putImageData(imageData, 0, 0);
      return tempCanvas.toDataURL('image/png');
    }
    
    return '';
  }

  public destroy() {
    const gl = this.gl;
    if (this.program) gl.deleteProgram(this.program);
    if (this.vertexShader) gl.deleteShader(this.vertexShader);
    if (this.vao) gl.deleteVertexArray(this.vao);
    if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer);
  }
}
