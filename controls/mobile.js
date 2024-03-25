
const canvas = document.getElementById('webgl-canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext('webgl2');

if (!gl) {
  console.error('Unable to initialize WebGL 2. Your browser may not support it.');
}


let mouseX = 0;
let mouseY = 0;

let targetPosition = [0, 5, 2];
let position = [0, 0, 2];
let speed = 0.5;

let keysPressed = {};
let touchStartX = 0;
let touchStartY = 0;

let modelViewMatrix = mat4.create(); // Ensure that modelViewMatrix is defined globally

// Velocity is part of the gravity
let velocityY = 0;
let gravity = -0.00; // Adjust gravity strength as needed

document.addEventListener('keydown', function(event) {
  keysPressed[event.key] = true;
});

document.addEventListener('keyup', function(event) {
  keysPressed[event.key] = false;
});

canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);

function handleTouchStart(event) {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  const sensitivity = 0.002;
  const deltaX = event.touches[0].clientX - touchStartX;
  const deltaY = event.touches[0].clientY - touchStartY;

  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;

  mouseX += deltaX * sensitivity;
  mouseY -= deltaY * sensitivity;

  mouseY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseY));
}

function handleMouseMove(event) {
  const sensitivity = 0.002;
  const deltaX = event.movementX || event.mozMovementX || 0;
  const deltaY = event.movementY || event.mozMovementY || 0;

  mouseX += deltaX * sensitivity;
  mouseY -= deltaY * sensitivity;

  mouseY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, mouseY));
}

function handleKeyInput() {
  const forward = vec3.create();
  const right = vec3.create();

  const forwardVector = vec3.create();
  const rightVector = vec3.create();

  forward[0] = -modelViewMatrix[2];
  forward[1] = -modelViewMatrix[6];
  forward[2] = -modelViewMatrix[10];

  right[0] = modelViewMatrix[0];
  right[1] = modelViewMatrix[4];
  right[2] = modelViewMatrix[8];

  vec3.normalize(forwardVector, forward);
  vec3.normalize(rightVector, right);

  const speedMultiplier = 0.05;

  if (keysPressed['s']) {
    targetPosition = vec3.scaleAndAdd([], targetPosition, forwardVector, -speedMultiplier);
  }
  if (keysPressed['w']) {
    targetPosition = vec3.scaleAndAdd([], targetPosition, forwardVector, speedMultiplier);
  }
  if (keysPressed['a']) {
    targetPosition = vec3.scaleAndAdd([], targetPosition, rightVector, -speedMultiplier);
  }
  if (keysPressed['d']) {
    targetPosition = vec3.scaleAndAdd([], targetPosition, rightVector, speedMultiplier);
  }
}

canvas.requestPointerLock =
  canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;

document.exitPointerLock =
  document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;

canvas.addEventListener('click', function() {
  canvas.requestPointerLock();
});

document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

function lockChangeAlert() {
  if (document.pointerLockElement === canvas ||
    document.mozPointerLockElement === canvas ||
    document.webkitPointerLockElement === canvas) {
    document.addEventListener('mousemove', handleMouseMove);
  } else {
    document.removeEventListener('mousemove', handleMouseMove);
  }
}

document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    document.exitPointerLock();
  }
});

function checkCollision(objectPosition, objectSize, floorPosition) {
  const objectHalfSize = vec3.scale(vec3.create(), objectSize, 0.5);

  const objectMin = vec3.subtract(vec3.create(), objectPosition, objectHalfSize);
  const objectMax = vec3.add(vec3.create(), objectPosition, objectHalfSize);

  const floorMin = vec3.subtract(vec3.create(), floorPosition, [1, 1, 1]);
  const floorMax = vec3.add(vec3.create(), floorPosition, [1, 1, 1]);

  // Check for overlap along each axis
  const overlapX = objectMin[0] < floorMax[0] && objectMax[0] > floorMin[0];
  const overlapY = objectMin[1] < floorMax[1] && objectMax[1] > floorMin[1];
  const overlapZ = objectMin[2] < floorMax[2] && objectMax[2] > floorMin[2];

  // Return true if there is overlap along all axes
  return overlapX && overlapY && overlapZ;
}

function applyGravity() {
  velocityY += gravity;
  targetPosition[1] += velocityY;
  if (targetPosition[1] < 0) {
    targetPosition[1] = 0;
    velocityY = 0;
  }
}
