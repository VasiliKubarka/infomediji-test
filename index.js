import { drawText } from "./textCanvas.js";
import { drawScene } from "./renderCanvas.js";

export const init = async () => {
  drawText();
  // load shaders from files
  const vShader = await fetch('v_shader.glsl').then(result => result.text());
  const fShader = await fetch('f_shader.glsl').then(result => result.text());
  drawScene(vShader, fShader)
}
