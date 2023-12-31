attribute vec4 a_Position;
attribute vec2 a_Coord;
uniform float u_Aspect;
uniform vec3 u_Translate;
uniform vec3 u_Rotate;
varying vec2 v_Coord;

highp mat4 transpose(in highp mat4 inMatrix) {
    highp vec4 i0 = inMatrix[0];
    highp vec4 i1 = inMatrix[1];
    highp vec4 i2 = inMatrix[2];
    highp vec4 i3 = inMatrix[3];

    highp mat4 outMatrix = mat4(
        vec4(i0.x, i1.x, i2.x, i3.x),
        vec4(i0.y, i1.y, i2.y, i3.y),
        vec4(i0.z, i1.z, i2.z, i3.z),
        vec4(i0.w, i1.w, i2.w, i3.w)
    );

    return outMatrix;
}

mat3 rotate(vec3 val) {
    mat3 rotateX = mat3(
        1.0, 0.0, 0.0,
        0.0, cos(val.x), -sin(val.x),
        0.0, sin(val.x), cos(val.x)
    );
    mat3 rotateY = mat3(
        cos(val.y), 0.0, sin(val.y),
        0.0, 1.0, 0.0,
        -sin(val.y), 0.0, cos(val.y)
    );
    mat3 rotateZ = mat3(
        cos(val.z), -sin(val.z), 0.0,
        sin(val.z), cos(val.z), 0.0,
        0.0, 0.0, 1.0
    );
    return rotateX * rotateY * rotateZ;
}


mat4 getPerspectiveMatrix(float fov, float aspect, float nearClip, float farClip) {
    return mat4(
        1.0 / (tan(fov * 0.5) * aspect), 0.0, 0.0, 0.0,
        0.0, 1.0 / tan(fov * 0.5), 0.0, 0.0,
        0.0, 0.0, -(farClip + nearClip) / (farClip - nearClip), -1.0,
        0.0, 0.0, -(2.0 * farClip * nearClip) / (farClip - nearClip), 0.0
    );
}

mat4 getViewMatrix(vec3 cameraPos, vec3 target, vec3 up) {
    vec3 forward = normalize(target - cameraPos);
    vec3 right = normalize(cross(up, forward));
    vec3 newUp = cross(forward, right);

    mat4 viewMatrix = mat4(
        vec4(right, 0.0),
        vec4(newUp, 0.0),
        vec4(-forward, 0.0),
        vec4(0.0, 0.0, 0.0, 1.0)
    );

    viewMatrix = transpose(viewMatrix);
    viewMatrix[3][0] = -dot(right, cameraPos);
    viewMatrix[3][1] = -dot(newUp, cameraPos);
    viewMatrix[3][2] = dot(forward, cameraPos);

    return viewMatrix;
}

void main() {
    mat4 translationMatrix = mat4(
        1.0, 0.0, 0.0, u_Translate.x,
        0.0, 1.0, 0.0, u_Translate.y,
        0.0, 0.0, 1.0, u_Translate.z,
        0.0, 0.0, 0.0, 1.0
    );
    mat4 rotationMatrix = mat4(rotate(u_Rotate));

    mat4 modelMatrix = transpose(rotationMatrix * translationMatrix);

    mat4 projectionMatrix = getPerspectiveMatrix(0.9, u_Aspect, 1.0, 100.0);
    mat4 viewMatrix = getViewMatrix(vec3(0.0, 0.0, 5.0), vec3(0.0, 0.0, -10.0), vec3(0.0, 1.0, 0.0));

    gl_Position =  projectionMatrix * viewMatrix * modelMatrix * a_Position;
    v_Coord = a_Coord;
}

