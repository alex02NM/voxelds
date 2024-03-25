// goal of this project multiple texutre all cornors and eash face could be formed in difference size
// simple lighting with bump texture
// add fog in webgl
// convert into int for better perfomance http://www.senchalabs.org/philogl/PhiloGL/examples/lessons/4/

const shaderSource = {
  vertex: `
    attribute vec4 a_position;
    attribute vec4 a_color;
    attribute vec2 a_textureCoord; // Add this line

    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_projectionMatrix;

    varying vec4 v_color;
    varying vec2 v_textureCoord;

    void main() {
        gl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;
        v_color = a_color;
        v_textureCoord = a_textureCoord;
    }
  `,
  fragment: `
     precision mediump float;
     varying vec4 v_color;
     
     varying vec2 v_textureCoord;
     uniform sampler2D u_texture;

     void main() {
         gl_FragColor = texture2D(u_texture, v_textureCoord) * v_color;
     }

     

     
  `,
};



function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}


//const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
const vertexShader = compileShader(gl, gl.VERTEX_SHADER, shaderSource.vertex);
//const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, shaderSource.fragment);

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking failed:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

function createAndBindBuffer(gl, target, data, attributeLocation, size) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, gl.STATIC_DRAW);
  gl.vertexAttribPointer(attributeLocation, size, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attributeLocation);

  return buffer;

}


//list of all the cubs position and colors 
var cubes = JSON.parse(data);
//var images = JSON.parse(images);

const positions = new Float32Array(cubes[1].cubes.red_cube.posision);
const colors = new Float32Array(cubes[1].cubes.red_cube.color);




// Load and bind multiple textures
const textures_cord = new Float32Array(cubes[1].cubes.red_cube.textures_cord);

var images = JSON.parse(images);
let textures = [];

// Get an array of the keys
var keysArray = Object.keys(images[0]);
// Get the length of the keys array
var keysLength = keysArray.length;
// Log the length of the keys
console.log("Number of keys:", keysLength);
var running = false;
for (key in images[0]) {
  //console.log("key: " + key);
  let data_image = images[0][key];
  //console.log("data", data_image);
  const image = new Image();
  // Set up the onload handler
  image.onload = function() {
    //document.body.appendChild(image);
    textures.push(image);
    // Check if all images are loaded
    if (images.every(img => img !== undefined)) {
      // Draw squares after all images are loaded
      //drawSquares();
      running = true;
    }
  };

  // Handle image loading errors
  image.onerror = function() {
    console.error('Error loading image:', base64Data);
  };
  // Use the provided base64-encoded image data directly
  //console.log("iteration", base64Data);
  image.src = data_image;
}








//const uTexture = gl.getUniformLocation(program, 'u_texture');
let startTextureUnit = 0;
function loadTextures(gl, textureImages) {
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  //gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[0]);
  gl.generateMipmap(gl.TEXTURE_2D);

}







const textureUniformLocation = gl.getUniformLocation(program, "u_texture");
const textureCoordAttributeLocation = gl.getAttribLocation(program, 'a_textureCoord');

// Create buffer for texture coordinates
const textureCoordBuffer = createAndBindBuffer(gl, gl.ARRAY_BUFFER, textures_cord, textureCoordAttributeLocation, 2);


const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');

// Create buffers for position and color data
const positionBuffer = createAndBindBuffer(gl, gl.ARRAY_BUFFER, positions, positionAttributeLocation, 3);
const colorBuffer = createAndBindBuffer(gl, gl.ARRAY_BUFFER, colors, colorAttributeLocation, 4);


const projectionMatrix = mat4.create();
//const modelViewMatrix = mat4.create();
const uProjectionMatrix = gl.getUniformLocation(program, 'u_projectionMatrix');
const uModelViewMatrix = gl.getUniformLocation(program, 'u_modelViewMatrix');

mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 250);
//mat4.lookAt(modelViewMatrix, [0, 0, 2], [0, 0, 0], [0, 1, 0]);

gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);


// Set the clear color (moved outside the animation loop)
//this is color of backend 
gl.clearColor(0.0, 0.0, 0.5, 1.0);
gl.enable(gl.DEPTH_TEST);



const fpsElement = document.getElementById('fps');
let frameCount = 0;
let startTime = performance.now();



//console.log("numCubes",floorPositions_top);
//gl.enable(gl.CULL_FACE);
//gl.frontFace(gl.CCW);


//const cameraPosition = [5.0, 5.0, -2.0];

console.log("track_block_pos", track_block_pos);

function animate() {
  // Check collision and update modelViewMatrix
  applyGravity();

  frameCount++;
  const now = performance.now();
  let elapsed = now - startTime;
  if (elapsed >= 1000) {
    const fps = (frameCount / elapsed) * 1000;
    fpsElement.textContent = `FPS: ${fps.toFixed(2)}`;

    frameCount = 0;
    startTime = now;
  }



  handleKeyInput();

  position = vec3.lerp([], position, targetPosition, 0.1);

  mat4.lookAt(
    modelViewMatrix,
    [position[0], position[1], position[2]],
    [position[0] + Math.sin(mouseX), position[1] + Math.sin(mouseY), position[2] - Math.cos(mouseX)],
    [0, 1, 0]
  );

  gl.clear(gl.COLOR_BUFFER_BIT);

  if (running === true) {


    // Assuming texturesArray contains textures for each side
    loadTextures(gl, textures);



  }



  for (let i = 1; i < 2; i++) {
    const tempMatrix = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrix, tempMatrix, [i, 0, 0]);

    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

    // Draw the cubes with texture coordinates

    gl.drawArrays(gl.TRIANGLES, 0, 36);

    mat4.copy(modelViewMatrix, tempMatrix);
  }



  // Loop through sections
  for (let i = 1; i < 2; i++) {
    const tempMatrix = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrix, tempMatrix, [2, 0, 0]);

    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

    // Draw the specific section of the cube's position coordinates
    gl.drawArrays(gl.TRIANGLES, 36, 12);

    mat4.copy(modelViewMatrix, tempMatrix);
  }

  const tempMatrix = mat4.create();

  for (let i = 0; i < track_block_pos.length; i++) {
    const position = track_block_pos[i];

    // Assuming each floor tile has a size of 2.0
    const translationVector = [position[0], position[1], position[2]];
    //console.log("translationVector",translationVector);
    const tempMatrix = mat4.clone(modelViewMatrix);
    mat4.translate(modelViewMatrix, tempMatrix, translationVector);

    //mat4.translate(modelViewMatrix, tempMatrix, translationVector);

    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

    // Draw the specific section of the cube's position coordinates
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    mat4.copy(modelViewMatrix, tempMatrix);
  }

  /*

  // Loop through sections
  for (let i = 0; i < 50; i++) {
    for (let j = 0; j < 50; j++) {
      const tempMatrix = mat4.clone(modelViewMatrix);

      // Assuming each floor tile has a size of 2.0
      const translationVector = [i, 0, j];
      mat4.translate(modelViewMatrix, tempMatrix, translationVector);

      gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);

      // Draw the specific section of the cube's position coordinates
      gl.drawArrays(gl.TRIANGLES, 12, 6);

      mat4.copy(modelViewMatrix, tempMatrix);
    }
  }
  */





  requestAnimationFrame(animate);
}

animate();


// Function to handle window resize
function handleResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}

// Handle initial resize
//handleResize();




// Listen for window resize events
window.addEventListener('resize', handleResize);
