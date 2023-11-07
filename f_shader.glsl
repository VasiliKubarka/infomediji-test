precision highp  float;
varying vec4 v_Color;
varying vec2 v_Coord;
uniform sampler2D u_Sampler;
uniform float u_SelectedWordIndex;
uniform float u_ListIndex;

float round(float n) {
    return float(int(n * 100000.0)) / 100000.0;
}

void main() {
    vec4 nextColor = texture2D(u_Sampler, v_Coord);
    nextColor.r = round(nextColor.r);
    nextColor.g = round(nextColor.g);

    // for r == 1 we want to replace with list index
    float replaceColor = round(1.0 / 255.0);
    if (nextColor.r == replaceColor) {
        nextColor.r = u_ListIndex / 255.0;
    }
    // if color == selectedWordIndex then replce with red color
    float selectedColor = round(u_SelectedWordIndex / 255.0);
    if (nextColor.g == selectedColor) {
        nextColor = vec4(1.0, 0.0, 0.0, 1.0);
    }

    gl_FragColor = nextColor;
}

