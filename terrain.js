const numCubes = 2
const cubePositions = Array.from({ length: numCubes }, (_, i) => [i * 2.0, 0.0, -5.0]);
// Loop through each floor tile
const floorSize = 100;
const cubeSize = 1;
const spacing = 0;
const floorPositions_top = [];

// Set your desired seed
const seed = Math.floor(Math.random() * 10000);
const random = createRandom(seed);
const amplitude = 50; // Adjust as needed
const time = 0; // You can animate the landscape by changing this over time
const frequency = 200;


function floor_tile() {
  for (let i = 0; i < floorSize; i++) {
    for (let j = 0; j < floorSize; j++) {
      floorPositions_top.push([
        i * (cubeSize + spacing) - (floorSize * (cubeSize + spacing)) / 2.0,
        0.0,
        -j * (cubeSize + spacing)
      ]);
    }
  }
}


function createRandom(seed) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return function() {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

let track_block_pos = [];

function generatePerlinLandscape() {
  // Pass the seed directly to the noise generator
  noise.seed(seed);
  let count = 0;

  // the for loop tracks the position of every block from x, y, z
  for (let i = 0; i < floorSize; i++) {
    for (let j = 0; j < floorSize; j++) {
      const perlinValue = noise.simplex3(i / frequency, j / frequency, time);
      const height = Math.abs(perlinValue * amplitude); // Adjust the amplitude to control the landscape height

      const roundedX = Math.round(i * (cubeSize + spacing) - (floorSize * (cubeSize + spacing)) / 2.0);
      const roundedHeight = Math.round(height);
      const roundedZ = Math.round(-j * (cubeSize + spacing));

      // Use a 1D array to store the position
      const position = [roundedX, roundedHeight, roundedZ];

      // Push the position to the array
      track_block_pos[count++] = position;
    }
  }
  // Now, track_block_pos is a 2D array containing the positions of each block.
  // Each element is an array [x, y, z] representing the position of a block in 3D space.
}


generatePerlinLandscape()