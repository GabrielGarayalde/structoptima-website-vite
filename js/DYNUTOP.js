// Required imports or initial setup
const { OrbitControls } = THREE;
import predictResult from "./predictResult.js";
import mapValueToColor from "./mapValueToColor.js";
import normalizeArray from "./normalizeArray.js";

const URL_topopt_FCM = new URL('/3DBridge_topopt_FCM/model.json', import.meta.url).href
const URL_topopt_FCM2 = new URL('/3DBridge_topopt_FCM2/model.json', import.meta.url).href
const URL_VM_FCM = new URL('/3DBridge_VM_FCM/model.json', import.meta.url).href
const URL_VM_FCM2 = new URL('/3DBridge_VM_FCM2/model.json', import.meta.url).href
const URL_TC_FCM = new URL('/3DBridge_TC_FCM/model.json', import.meta.url).href
const URL_TC_FCM2 = new URL('/3DBridge_TC_FCM2/model.json', import.meta.url).href


function setCanvasSize() {
  var canvas = document.getElementById("DYNUTOP");

  if (window.innerWidth < 700) {
    canvas.width = 300; // Set the canvas width to 80% of the window width
    canvas.height = 300; // Set the canvas height to 60% of the window height
  } else if (window.innerWidth < 1024) {
    canvas.width = 500; // Set the canvas width to 80% of the window width
    canvas.height = 500; // Set the canvas height to 60% of the window height
  } else if (window.innerWidth < 1440) {
    canvas.width = 600; // Set the canvas width to 80% of the window width
    canvas.height = 600; // Set the canvas height to 60% of the window height
  } else {
    canvas.width = 700; // Set the canvas width to 80% of the window width
    canvas.height = 700; // Set the canvas height to 60% of the window height
  }
}

// Part 1: Model Loading
async function loadModels() {
  function sizeLoadingBar(val) {
    loadingBarInner.style.width = val * 100 + "%";
  }
  const canvas = document.querySelector("#DYNUTOP");

  let loadingBarInner = document.querySelector("#loading-bar .inner");
  let loadingBarContainer = document.querySelector("#loading-bar-container");

  // const URL_topopt_FCM =
  //   "../research-articles/DYNUTOP/3DBridge_topopt_FCM/model.json";

  // const URL_topopt_FCM2 =
    // "../research-articles/DYNUTOP/3DBridge_topopt_FCM2/model.json";

  // const URL_VM_FCM = "../research-articles/DYNUTOP/3DBridge_VM_FCM/model.json";

  // const URL_VM_FCM2 =
  //   "../research-articles/DYNUTOP/3DBridge_VM_FCM2/model.json";

  // const URL_TC_FCM = "../research-articles/DYNUTOP/3DBridge_TC_FCM/model.json";

  // const URL_TC_FCM2 =
  //   "../research-articles/DYNUTOP/3DBridge_TC_FCM2/model.json";

  console.time("loadModels");
  const topopt_FCM = await tf.loadGraphModel(URL_topopt_FCM);
  sizeLoadingBar(1 / 6);
  const topopt_FCM2 = await tf.loadGraphModel(URL_topopt_FCM2);
  sizeLoadingBar(2 / 6);
  const VM_FCM = await tf.loadGraphModel(URL_VM_FCM);
  sizeLoadingBar(3 / 6);
  const VM_FCM2 = await tf.loadGraphModel(URL_VM_FCM2);
  sizeLoadingBar(4 / 6);
  const TC_FCM = await tf.loadGraphModel(URL_TC_FCM);
  sizeLoadingBar(5 / 6);
  const TC_FCM2 = await tf.loadGraphModel(URL_TC_FCM2);
  sizeLoadingBar(1);

  loadingBarContainer.innerHTML = `
      <p id="loading-bar-message">Left click and orbit the 3D model using the mouse.</p>
    `;
  canvas.addEventListener("mousedown", () => {
    loadingBarContainer.style.display = "none";
  });

  console.timeEnd("loadModels");

  return {
    topopt_FCM,
    topopt_FCM2,
    VM_FCM,
    VM_FCM2,
    TC_FCM,
    TC_FCM2,
  };
}

// Part 2: Scene Initialization (Independent of Models)
function setupScene() {
  const canvas = document.querySelector("#DYNUTOP");
  // Create the scene
  const scene = new THREE.Scene();

  // Set up the camera
  const camera = new THREE.PerspectiveCamera(
    75, // Field of View
    window.innerWidth / window.innerHeight, // Aspect Ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
  );
  camera.position.set(0, 0, 50); // Adjust as needed

  // Set up the renderer
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  // renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0xffffff, 1); // Background color

  // Add OrbitControls for camera manipulation
  const controls = new OrbitControls(camera, renderer.domElement);

  // Optional: Add lighting to the scene
  const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Mimic sunlight
  directionalLight.position.set(0, 1, 0); // Adjust as needed
  scene.add(ambientLight, directionalLight);

  // Optional: Add a grid helper to the scene
  const size = 60; // Size of the grid
  const divisions = 20; // Number of divisions
  const gridHelper = new THREE.GridHelper(size, divisions);
  scene.add(gridHelper);

  // Set canvas resize behavior
  // window.addEventListener("resize", () => {
  //   camera.aspect = window.innerWidth / window.innerHeight;
  //   camera.updateProjectionMatrix();
  //   renderer.setSize(window.innerWidth, window.innerHeight);
  // });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();

  // Return scene components for further use
  return { scene, camera, renderer, controls };
}

// Part 3: Update Elements (Dependent on Models)
function initializeWithModels(models, sceneSetup) {
  // This function initializes or updates elements that depend on loaded models.
  console.log("Models loaded:", models);
  let params = [0.5, 0.5, 0.5, 0.5];
  let valuesTopopt = [];

  valuesTopopt = predictResult(params, models.topopt_FCM, models.topopt_FCM2);

  console.log("cubes have been pushed");
  const numRows = 60;
  const numCols = 20;
  const numChannels = 4;
  const cutoff = 0.1;

  let index = 0;
  // let cubesArray1 = [];
  // let cubesArray2 = [];

  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      for (let k = 0; k < numChannels; k++) {
        let density_value = valuesTopopt[index];

        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshBasicMaterial({
          color: mapValueToColor(density_value, "topopt"),
          opacity: density_value > cutoff ? 1 : 0,
          transparent: true,
        });

        // first half of the bridge
        const position1 = [i - numRows / 2, numCols - j, k - numChannels + 1];
        let cube1 = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube1.position.set(...position1);
        sceneSetup.scene.add(cube1);
        cubesArray1.push(cube1);

        // second half of the bridge
        const position2 = [i - numRows / 2, numCols - j, numChannels - 1 - k];
        let cube2 = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube2.position.set(...position2);
        sceneSetup.scene.add(cube2);
        cubesArray2.push(cube2);

        index++;
      }
    }
  }
}

// Part 4: Main Execution Flow
let models; // Global variable to hold models after they are loaded
let currentType = "topopt";
let valuesTopopt = [];
let valuesVM = [];
let valuesTC = [];
let params = [0.5, 0.5, 0.5, 0.5];
let index = 0;
let cubesArray1 = [];
let cubesArray2 = [];
let cutoff = 0.1;
setCanvasSize()

async function main() {
  try {
    const sceneSetup = setupScene(); // Setup scene, camera, renderer, and controls
    models = await loadModels(); // Load models asynchronously and store in global variable
    initializeWithModels(models, sceneSetup); // Initialize with loaded models and scene setup
    console.log(cubesArray1);
    setupEventListeners(models, sceneSetup); // Setup event listeners with access to models and scene setup
  } catch (error) {
    console.error("Failed to load models or setup the scene:", error);
  }
}

function setupEventListeners(models, { scene, camera, renderer, controls }) {
  let supportAOutput = document.getElementById("supportAValue");
  let supportBOutput = document.getElementById("supportBValue");
  let forceAOutput = document.getElementById("forceAValue");
  let forceBOutput = document.getElementById("forceBValue");

  // Setup sliders event listeners
  let paramSliders = document.querySelectorAll("input[name=params]");
  paramSliders.forEach((slider, index) => {
    slider.addEventListener("input", () => {
      // Update output based on slider value
      // Example for supportA:
      let value = parseFloat(slider.value);

      if (index === 0) supportAOutput.textContent = (value * 15).toFixed(2);
      if (index === 1)
        supportBOutput.textContent = (value * 15 + 45).toFixed(2);
      if (index === 2) forceAOutput.textContent = (value * 60).toFixed(2);
      if (index === 3) forceBOutput.textContent = (value * 60).toFixed(2);
      // Update parameters
      params[index] = value;

      // Call a function to update the scene or visualization based on new parameters
      // This function should use the models for predictions or updates and then modify the scene accordingly
      updateElements(currentType);
    });
  });

  // Setup radio buttons event listeners
  let radButtons = document.querySelectorAll("input[name=options]");
  radButtons.forEach((radio) => {
    radio.addEventListener("change", () => {
      // Update currentType or any other necessary state
      currentType = radio.value;

      // Again, update visualization based on the new choice
      updateElements(currentType);
    });
  });
}

function updateElements(type) {
  if (type === "topopt")
    valuesTopopt = predictResult(params, models.topopt_FCM, models.topopt_FCM2);
  let valuesFinal = valuesTopopt;
  if (type === "VM") {
    valuesTopopt = predictResult(params, models.topopt_FCM, models.topopt_FCM2);
    valuesVM = predictResult(params, models.VM_FCM, models.VM_FCM2);
    valuesFinal = normalizeArray(valuesFinal);
  }
  if (type === "TC") {
    valuesTopopt = predictResult(params, models.topopt_FCM, models.topopt_FCM2);
    valuesTC = predictResult(params, models.TC_FCM, models.TC_FCM2);
    valuesFinal = valuesTC.map((x) => (x - 0.5) * 2);
  }
  let chosen_value = 0;
  for (let index in cubesArray1) {
    chosen_value = valuesFinal[index];
    // console.log(chosen_value);
    cubesArray1[index].material.color.set(mapValueToColor(chosen_value, type));
    cubesArray1[index].material.opacity = valuesTopopt[index] > cutoff ? 1 : 0;

    cubesArray2[index].material.color.set(mapValueToColor(chosen_value, type));
    cubesArray2[index].material.opacity = valuesTopopt[index] > cutoff ? 1 : 0;
  }
}

main(); // Execute main function
