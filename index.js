const MOUSE = {
  x: 0,
  y: 0,
}

const getRandomFromRange = (start, end) => {
  return start + Math.random() * (end - start);
}

const N_OF_POINTS = 4;

const CONFIG = (() => {
  return Array(50).fill().map(() => ({
    rotate: new Float32Array([
      getRandomFromRange(0, Math.PI),
      getRandomFromRange(0, Math.PI), // not used
      getRandomFromRange(0, Math.PI), // not used
    ]),
    rotateSpeed: [
      getRandomFromRange(0.00001, 0.001),
      getRandomFromRange(0.00001, 0.001),
      getRandomFromRange(0.00001, 0.001),
    ],
    translate: new Float32Array([
      getRandomFromRange(-2, 2),
      getRandomFromRange(-2, 2),
      getRandomFromRange(-5, 3),
    ]),
  }))
})()

let canvas = null
let gl = WebGL2RenderingContext;
let program = WebGLProgram


function drawSceneCanvas() {
  canvas = document.getElementById('result')

  canvas.width = canvas.clientWidth * devicePixelRatio
  canvas.height = canvas.clientHeight * devicePixelRatio
  gl = canvas.getContext('webgl')


  addProgram()
  initVertexBuffers();
  loadTexture()

  const u_Aspect = gl.getUniformLocation(program, 'u_Aspect')
  gl.uniform1f(u_Aspect, canvas.width / canvas.height)


  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  canvas.addEventListener('mousemove', onMouseMove, false);
  animate()
}

function onMouseMove(ev) {
  MOUSE.x = ev.x * devicePixelRatio;
  MOUSE.y = canvas.height - ev.y * devicePixelRatio;
}

function animate() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  // draw initial lists with words
  CONFIG.forEach(({ translate, rotate }, index) => {
    draw(translate, rotate, index + 1, 0)
  })

  // get pixels colors where r is index of list and g index of word
  const pixels = new Uint8Array(4);
  gl.readPixels(MOUSE.x, MOUSE.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  const [listIndex, wordIndex] = pixels;

  // if list index is correct, update word index color
  if ( listIndex > 0 && listIndex <= CONFIG.length ) {
    const { translate, rotate } = CONFIG[listIndex - 1];
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(-1, 0.1)
    draw(translate, rotate, listIndex, wordIndex)
    gl.disable(gl.POLYGON_OFFSET_FILL)
  }

  // rotate just for fun
  CONFIG.forEach(({ rotate, rotateSpeed }) => {
    for (let i = 0; i < rotateSpeed.length; i++) {
      rotate[i] += rotateSpeed[i]
    }
  })

  requestAnimationFrame(animate)
}

function draw(translate, rotate, listIndex, selectedWordIndex) {
  gl.uniform3fv(gl.getUniformLocation(program, 'u_Translate'), translate);
  gl.uniform3fv(gl.getUniformLocation(program, 'u_Rotate'), rotate);
  gl.uniform1f(gl.getUniformLocation(program, 'u_ListIndex'), listIndex);
  gl.uniform1f(gl.getUniformLocation(program, 'u_SelectedWordIndex'), selectedWordIndex)

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, N_OF_POINTS);
}


const loadShader = (type, text) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, text);
  gl.compileShader(shader);

  var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if ( !compiled ) {
    const error = gl.getShaderInfoLog(shader);
    console.log('Failed to compile shader: ' + error);
  }

  return shader
}
const addProgram = () => {
  const vertexShader = loadShader(gl.VERTEX_SHADER, document.getElementById('vShader').text);
  const fragmentShader = loadShader(gl.FRAGMENT_SHADER, document.getElementById('fShader').text);

  program = gl.createProgram();

  // Attach the shader objects
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);
  gl.useProgram(program)

}

function initVertexBuffers() {
  const positions = new Float32Array([
    -0.5, 0.5, 0.0, 1.0,
    -0.5, -0.5, 0.0, 0.0,
    0.5, 0.5, 1.0, 1.0,
    0.5, -0.5, 1.0, 0.0,
  ]);

  const vertexPosBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const a_Position = gl.getAttribLocation(program, 'a_Position');
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, positions.BYTES_PER_ELEMENT * 4, 0);
  gl.enableVertexAttribArray(a_Position);

  const a_Coord = gl.getAttribLocation(program, 'a_Coord');
  gl.vertexAttribPointer(a_Coord, 2, gl.FLOAT, false, positions.BYTES_PER_ELEMENT * 4, positions.BYTES_PER_ELEMENT * 2);
  gl.enableVertexAttribArray(a_Coord);
}

function loadTexture() {
  const texture = gl.createTexture();
  const textureCanvas = document.getElementById('text')
  const u_Sampler = gl.getUniformLocation(program, 'u_Sampler');

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, textureCanvas);

  gl.uniform1i(u_Sampler, 0);
}


function drawTextCanvas() {
  const config = {
    textPadding: 0.3,
    get textHeight() {
      return 1 - this.textPadding * 2
    },
    _text: 'hello world example text',
    get text() {
      return this._text.split(' ')
    },
  }

  const textCanvas = document.getElementById('text')
  const ctx = textCanvas.getContext('2d')

  ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);

  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, textCanvas.width, textCanvas.height)
  ctx.textAlign = "center";
  ctx.textBaseline = "middle"
  ctx.font = "bold 94px monospace";
  ctx.save();
  config.text.map((value, index, arr) => {
    const wordIndex = index + 1; // word index used to detect hovered word
    ctx.fillStyle = `rgba(1, ${ wordIndex }, 0)`
    const x = textCanvas.height * (index / (arr.length - 1)) * config.textHeight;
    ctx.fillText(value, textCanvas.width / 2, textCanvas.height * config.textPadding + x);
  })
  ctx.restore();
}

window.onload = () => {
  drawTextCanvas();
  drawSceneCanvas()
}
