function setCanvasSize() {
  var canvas = document.getElementById("MCTS_floor_canvas");

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

// Call this function on page load or whenever you need to adjust the canvas size
setCanvasSize();

// ///////////////////////////////////////////////////////
//              SETTING THE VARIABLES
// ///////////////////////////////////////////////////////

// The functionality for dragging and selcting nodes on the grid
var isDragging = false;
let startNode = null;
let endNode = null;
let loadsData = []; // Array to store each load's data
var dragStart = { x: 0, y: 0 };
var dragEnd = { x: 0, y: 0 };
var selectedNodes = [];
var canvas = document.getElementById("MCTS_floor_canvas");
var ctx = canvas.getContext("2d");
let responseData = null;
let currentLoadType = "pressure"; // Default value

// ///////////////////////////////////////////////////////
// ----       UPDATING THE CANVAS w Loads           ----//
// ///////////////////////////////////////////////////////

// gridData
// drawGrid
// UpdateCanvas
// renderLoadsOnCanvas
// highlightSelectedNodes
// selectNodesInRectangle

// important geometrical info about the canvas
function gridData() {
  let canvas = document.getElementById("MCTS_floor_canvas");

  // Define maximum values for sliders
  var maxX = document.getElementById("x").max;
  var maxY = document.getElementById("y").max;

  // Get the values of xSlider and ySlider
  var xSlider = parseInt(document.getElementById("x").value);
  var ySlider = parseInt(document.getElementById("y").value);

  // Calculate margins as a fraction of the canvas dimensions
  var marginX = canvas.width * 0.1;
  var marginY = canvas.height * 0.1;

  // Adjusted width and height for grid drawing
  var portWidth = canvas.width - 2 * marginX;
  var portHeight = canvas.height - 2 * marginY;

  var scaleX = portWidth / maxX;
  var scaleY = portHeight / maxY;

  var gridSizeX = xSlider * scaleX;
  var gridSizeY = ySlider * scaleY;

  return {
    marginX,
    marginY,
    portWidth,
    portHeight,
    scaleX,
    scaleY,
    gridSizeX,
    gridSizeY,
    maxX,
    maxY,
  };
}

function drawGrid() {
  var canvas = document.getElementById("MCTS_floor_canvas");
  var ctx = canvas.getContext("2d");

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Retrieve grid coordinates
  let coordinates = getGridCoordinates(); // Assuming this returns an array of [x, y] pairs

  // Retrieve slider values for X and Y
  var x = parseInt(document.getElementById("x").value);
  var y = parseInt(document.getElementById("y").value);

  var maxY = document.getElementById("y").max;
  var maxX = document.getElementById("x").max;

  // Calculate margins as a fraction of the canvas dimensions
  var marginX = canvas.width * 0.1;
  var marginY = canvas.height * 0.1; // - (yMax * scale); // Adjust vertical margin based on yMax

  // Ensure marginY is not less than a minimum margin to keep the grid visible
  marginY = Math.max(marginY, 20); // Ensure there's at least a 20px margin at the top

  var portHeight = canvas.height - 2 * marginY;
  var portWidth = canvas.width - 2 * marginX;

  var scaleY = portHeight / maxY;
  var scaleX = portWidth / maxX;

  var gridSizeX = x * scaleX;
  var gridSizeY = y * scaleY;

  // Set fill color to grey
  ctx.fillStyle = "rgb(100,100,100)";

  // Draw points for each coordinate, adjusting for the margin
  coordinates.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(
      marginX + x * scaleX, // Use constant scale for X
      marginY + gridSizeY - y * scaleY, // Adjust Y-coordinate calculation
      1, // Radius of the circle to draw
      0, // Start angle
      2 * Math.PI // End angle
    );
    ctx.fill();
  });

  // Draw a black rectangle around the grid
  ctx.strokeStyle = "black"; // Set stroke color to black
  ctx.lineWidth = 2; // Set line width
  ctx.strokeRect(marginX, marginY, gridSizeX, gridSizeY);
}

// Initialize the canvas grid
drawGrid();

function updateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas first
  drawGrid(); // Redraw the grid
  renderLoadsOnCanvas(loadsData); // Update canvas rendering
  highlightSelectedNodes(); // Highlight selected nodes
}

function renderLoadsOnCanvas(loads) {
  const { marginX, marginY, scaleX, scaleY, gridSizeY } = gridData(); // Reuse the gridData for canvas metrics
  // const colors = ["red", "green", "blue", "purple", "orange"]; // Define a set of colors for different loads
  const colors = [
    "#FFB3BA",
    "#FFDFBA",
    "#B3E5FC",
    "#BAFFC9",
    "#BAE1FF",
    "#D1C4E9",
    "#C5E1A5",
  ]; // Updated pastel colors

  var xSlider = parseInt(document.getElementById("x").value);
  var ySlider = parseInt(document.getElementById("y").value);

  console.log(loads);
  loads.forEach((load, index) => {
    const color = colors[index % colors.length]; // Cycle through colors for each load
    ctx.fillStyle = color;

    const shadingWidth = 200 * scaleX; // Adjust shading width as needed

    const minX = Math.min(load.start[0], load.end[0]);
    const minY = Math.min(load.start[1], load.end[1]);
    const maxX = Math.max(load.start[0], load.end[0]);
    const maxY = Math.max(load.start[1], load.end[1]);

    const screen_minX = marginX + minX * scaleX;
    const screen_minY = marginY + gridSizeY - maxY * scaleY;

    const selectedNodesWidth = (maxX - minX) * scaleX;
    const selectedNodesHeight = (maxY - minY) * scaleY;

    var adjust_minX = shadingWidth / 2;
    var adjust_height = shadingWidth / 2;
    var adjust_width = shadingWidth / 2;
    var adjust_minY = shadingWidth / 2;

    if (minX === 0) {
      adjust_minX = 0;
    }

    if (minY === 0) {
      adjust_height = 0;
    }

    if (maxX === xSlider) {
      adjust_width = 0;
    }

    if (maxY === ySlider) {
      adjust_minY = 0;
    }

    const finalX = screen_minX - adjust_minX;
    const finalY = screen_minY - adjust_minY;
    const finalWidth = selectedNodesWidth + adjust_minX + adjust_width;
    const finalHeight = selectedNodesHeight + adjust_minY + adjust_height;
    const cornerRadius = 10; // Adjust corner radius as needed

    // Draw the rounded rectangle
    ctx.beginPath();
    ctx.moveTo(finalX + cornerRadius, finalY);
    ctx.lineTo(finalX + finalWidth - cornerRadius, finalY);
    ctx.quadraticCurveTo(
      finalX + finalWidth,
      finalY,
      finalX + finalWidth,
      finalY + cornerRadius
    );
    ctx.lineTo(finalX + finalWidth, finalY + finalHeight - cornerRadius);
    ctx.quadraticCurveTo(
      finalX + finalWidth,
      finalY + finalHeight,
      finalX + finalWidth - cornerRadius,
      finalY + finalHeight
    );
    ctx.lineTo(finalX + cornerRadius, finalY + finalHeight);
    ctx.quadraticCurveTo(
      finalX,
      finalY + finalHeight,
      finalX,
      finalY + finalHeight - cornerRadius
    );
    ctx.lineTo(finalX, finalY + cornerRadius);
    ctx.quadraticCurveTo(finalX, finalY, finalX + cornerRadius, finalY);
    ctx.closePath();
    ctx.fill();

    let load_multiplier;
    let load_units;
    if (load.type === "pressure") {
      load_multiplier = 1000;
      load_units = "kPa";
    } else if (load.type === "line") {
      load_multiplier = 1;
      load_units = "kNm";
    } else if (load.type === "point") {
      load_multiplier = 0.001;
      load_units = "kN";
    } else {
      load_multiplier = 1;
      load_units = ""; // Default case if load type doesn't match any of the above
    }

    let load_name = load.name || load.type;

    // Draw the light border
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"; // Light border color
    ctx.stroke();

    // Draw the numerical identifier in the middle of the rectangle
    ctx.fillStyle = "black"; // Use white for better visibility
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    // Draw the first line with the index and load type
    ctx.fillText(
      `${index + 1}: ${load_name} [${load_units}]`,
      finalX + finalWidth / 2,
      finalY + finalHeight / 2 - 10 // Move this line up slightly
    );

    // Draw the second line with the load details
    ctx.fillText(
      `{G: ${(load.G * load_multiplier).toFixed(2)}, Q: ${(
        load.Q * load_multiplier
      ).toFixed(2)}}`,
      finalX + finalWidth / 2,
      finalY + finalHeight / 2 + 10 // Move this line down slightly
    );
  });
}

function highlightSelectedNodes() {
  var { marginX, marginY, scaleX, scaleY, gridSizeY } = gridData();

  var xSlider = parseInt(document.getElementById("x").value);
  var ySlider = parseInt(document.getElementById("y").value);

  ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Semi-transparent red for selected nodes area

  if (selectedNodes.length === 0) {
    console.log("No nodes selected");
    return;
  }

  // Determine the bounds of the selected nodes
  let minX = Math.min(...selectedNodes.map((node) => node[0]));
  let minY = Math.min(...selectedNodes.map((node) => node[1]));
  let maxX = Math.max(...selectedNodes.map((node) => node[0]));
  let maxY = Math.max(...selectedNodes.map((node) => node[1]));

  // console.log("min", minX,minY)
  // console.log("max", maxX,maxY)

  const screen_minX = marginX + minX * scaleX;
  const screen_minY = marginY + gridSizeY - maxY * scaleY;

  const shadingWidth = 200 * scaleX; // Adjust shading width as needed

  const selectedNodesWidth = (maxX - minX) * scaleX;
  const selectedNodesHeight = (maxY - minY) * scaleY;

  var adjust_minX = shadingWidth / 2;
  var adjust_height = shadingWidth / 2;
  var adjust_width = shadingWidth / 2;
  var adjust_minY = shadingWidth / 2;

  if (minX === 0) {
    adjust_minX = 0;
  }

  if (minY === 0) {
    adjust_height = 0;
  }

  if (maxX === xSlider) {
    adjust_width = 0;
  }

  if (maxY === ySlider) {
    adjust_minY = 0;
  }

  ctx.fillRect(
    screen_minX - adjust_minX,
    screen_minY - adjust_minY,
    selectedNodesWidth + adjust_minX + adjust_width,
    selectedNodesHeight + adjust_minY + adjust_height
  );

  startNode = [minX, minY];
  endNode = [maxX, maxY];
}

function selectNodesInRectangle() {
  var { marginX, marginY, scaleX, scaleY, gridSizeY } = gridData();

  const startX = Math.min(dragStart.x, dragEnd.x);
  const endX = Math.max(dragStart.x, dragEnd.x);
  const startY = Math.min(dragStart.y, dragEnd.y);
  const endY = Math.max(dragStart.y, dragEnd.y);

  let coordinates = getGridCoordinates(); // Assuming this returns an array of [x, y] pairs

  selectedNodes = coordinates.filter(([x, y]) => {
    let screenX = marginX + x * scaleX;
    let screenY = marginY + gridSizeY - y * scaleY;
    return (
      screenX >= startX &&
      screenX <= endX &&
      screenY >= startY &&
      screenY <= endY
    );
  });
}

function getGridCoordinates() {
  var xSliderValue = parseInt(document.getElementById("x").value);
  var ySliderValue = parseInt(document.getElementById("y").value);

  var spacingX = 200; // Spacing between points in x direction
  var spacingY = 200; // Spacing between points in y direction

  var numOfPointsX = xSliderValue / 200 + 1; // Number of points in x direction
  var numOfPointsY = ySliderValue / 200 + 1; // Number of points in y direction

  var coordinates = [];

  for (var i = 0; i < numOfPointsY; i++) {
    for (var j = 0; j < numOfPointsX; j++) {
      var xCoord = j * spacingX;
      var yCoord = i * spacingY;
      coordinates.push([xCoord, yCoord]);
    }
  }

  return coordinates;
}

// Detect the load type based on selected nodes
function detectLoadType(selectedNodes) {
  if (selectedNodes.length === 1) {
    return "point";
  }

  const xValues = selectedNodes.map((node) => node[0]);
  const yValues = selectedNodes.map((node) => node[1]);

  const xRange = Math.max(...xValues) - Math.min(...xValues);
  const yRange = Math.max(...yValues) - Math.min(...yValues);

  if (xRange === 0) {
    return "line";
  } else if (yRange === 0) {
    return "line";
  } else {
    return "pressure";
  }
}

// Show the load modal with dynamic content
function showLoadModal(selectedNodes) {
  const loadType = detectLoadType(selectedNodes);
  currentLoadType = loadType; // Store the detected load type

  const modal = document.getElementById("loadModal");
  const loadTitle = modal.querySelector("h3");
  const gUnit = modal.querySelector("#loadInput1").nextElementSibling;
  const qUnit = modal.querySelector("#loadInput2").nextElementSibling;

  if (loadType === "point") {
    loadTitle.textContent = "Point Load Detected";
    gUnit.textContent = "kN";
    qUnit.textContent = "kN";
  } else if (loadType === "line") {
    loadTitle.textContent = "Line Load Detected";
    gUnit.textContent = "kNm";
    qUnit.textContent = "kNm";
  } else {
    loadTitle.textContent = "Pressure Load Detected";
    gUnit.textContent = "kPa";
    qUnit.textContent = "kPa";
  }

  modal.showModal();
}

// Show the load modal
// function showLoadModal(selectedNodes) {
//   var modal = document.getElementById("loadModal"); // Ensure this ID matches your dialog's ID
//   modal.showModal();
// }

// close the load modal
function closeLoadModal() {
  var modal = document.getElementById("loadModal"); // Ensure this ID matches your dialog's ID
  modal.close();
}

canvas.addEventListener("mousedown", function (e) {
  isDragging = true;
  dragStart.x = e.offsetX;
  dragStart.y = e.offsetY;
  dragEnd.x = e.offsetX;
  dragEnd.y = e.offsetY;
  selectedNodes = []; // Clear previous selections
  updateCanvas();
});

canvas.addEventListener("mousemove", function (e) {
  if (isDragging) {
    dragEnd.x = e.offsetX;
    dragEnd.y = e.offsetY;
    selectNodesInRectangle();
    updateCanvas();
  }
});

canvas.addEventListener("mouseup", function (e) {
  selectNodesInRectangle();
  if (isDragging && selectedNodes.length > 0) {
    updateCanvas(); // Update canvas if needed
    showLoadModal(selectedNodes); // Show the modal only if nodes have been selected
  }
  isDragging = false; // Reset dragging flag
});

// ///////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////
// DIMENSIONS, CONSTRAINTS, LOADS, RESULTS, RESULTS CARDS
// ///////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////

// ///////////////////////////////////////////////////////
//                     DIMENSIONS
// ///////////////////////////////////////////////////////

// Event listener for when the dimension sliders are changed
document.addEventListener("DOMContentLoaded", function () {
  const xSlider = document.getElementById("x");
  const ySlider = document.getElementById("y");

  // Attach the event listeners
  xSlider.addEventListener("input", resetInputs);
  ySlider.addEventListener("input", resetInputs);
});

// Function to update slider value display
function updateSliderValue(sliderId, displayId) {
  var slider = document.getElementById(sliderId);
  var display = document.getElementById(displayId);
  // if the sliderId is pressureLoad, then the display value is multiplied by 1000
  if (sliderId === "pressureLoad") {
    display.textContent = slider.value * 1000;
  } else {
    display.textContent = slider.value;
  }

  // Add event listener to update the display when the slider value changes
  slider.addEventListener("input", function () {
    if (sliderId === "pressureLoad") {
      display.textContent = slider.value * 1000;
    } else {
      display.textContent = slider.value;
    }

    drawGrid();
  });
}

// Call this function for each slider with its corresponding display element
updateSliderValue("x", "xValue");
updateSliderValue("y", "yValue");
updateSliderValue("maxDeflection", "maxDeflectionValue");
updateSliderValue("maxDepth", "maxDepthValue");
updateSliderValue("maxRatio", "maxRatioValue");

// ///////////////////////////////////////////////////////
//                       LOADS
// ///////////////////////////////////////////////////////

// When the loads accordion is open we want to render the loads
document
  .getElementById("loadsAccordion")
  .addEventListener("change", function () {
    if (this.checked) {
      drawGrid(); // Redraw the grid
      renderLoadsOnCanvas(loadsData); // Update canvas rendering
    }
  });

// accepts the load input from the modal
function acceptLoad() {
  let load_multiplier = 1;
  if (currentLoadType === "point") {
    load_multiplier = 1000;
  } else if (currentLoadType === "line") {
    load_multiplier = 1;
  } else if (currentLoadType === "pressure") {
    load_multiplier = 0.001;
  }

  const loadName = document.getElementById("loadNameInput").value.trim();
  const loadG = document.getElementById("loadInput1").value * load_multiplier;
  const loadQ = document.getElementById("loadInput2").value * load_multiplier;

  // Create a new load object
  const newLoad = {
    start: startNode,
    end: endNode,
    type: currentLoadType, // Use the dynamically determined load type
    name: loadName !== "" ? loadName : null, // Set to null if no name provided
    G: parseFloat(loadG),
    Q: parseFloat(loadQ),
  };

  // Append new load to the data array
  loadsData.push(newLoad);

  console.log(loadsData);
  // Update the UI or further process the data
  updateLoadsTextContainerDisplay(); // Assumes there's a function to update UI
  drawGrid();
  renderLoadsOnCanvas(loadsData); // Update canvas rendering
  closeLoadModal(); // Close modal after accepting
}

function updateLoadsTextContainerDisplay() {
  const loadsContainer = document.getElementById("loads-values-container");
  // Clear the existing contents of the container
  loadsContainer.innerHTML = "";

  // Loop through each load in the loadsData and create a row for each
  loadsData.forEach((load, index) => {
    // Determine the load multiplier and units based on the load type
    let load_multiplier;
    let load_units;

    if (load.type === "pressure") {
      load_multiplier = 1000;
      load_units = "kPa";
    } else if (load.type === "line") {
      load_multiplier = 1;
      load_units = "kNm";
    } else if (load.type === "point") {
      load_multiplier = 0.001;
      load_units = "kN";
    } else {
      load_multiplier = 1;
      load_units = ""; // Default case if load type doesn't match any of the above
    }

    let load_name = load.name || load.type;

    const newRow = document.createElement("div");
    newRow.className = "grid grid-cols-4 gap-4 items-center"; // Updated for 4 columns

    newRow.innerHTML = `
          <div class="text-center">
              <span>${index + 1}: ${load_name} load</span>
          </div>
          <div class="text-center">${(load.G * load_multiplier).toFixed(
            2
          )} ${load_units}</div>
          <div class="text-center">${(load.Q * load_multiplier).toFixed(
            2
          )} ${load_units}</div>
          <div class="text-center">
              <button class="btn btn-error deleteBtn" data-index="${index}">Delete</button>
          </div>
      `;

    loadsContainer.appendChild(newRow);
  });

  // Add event listeners to all delete buttons after all rows are created
  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const index = parseInt(this.getAttribute("data-index"));
      deleteLoad(index);
      // resetInputs();
    });
  });
}

// Function to handle deletion of a load
function deleteLoad(index) {
  // Remove the load from the array
  loadsData.splice(index, 1);

  // Update the UI
  updateLoadsTextContainerDisplay();
  drawGrid(); // Redraw the grid

  // Optionally update the canvas if necessary
  renderLoadsOnCanvas(loadsData);
  resetResponseCards();
  resetResultSliderTile();
}

// event listener for the load modal
document.addEventListener("DOMContentLoaded", (event) => {
  // Listener for the accept button
  const acceptBtn = document.getElementById("acceptButton");
  acceptBtn.addEventListener("click", acceptLoad);

  // Listener for the cancel button
  const cancelBtn = document.getElementById("cancelButton");
  cancelBtn.addEventListener("click", closeLoadModal);
});

// ///////////////////////////////////////////////////////
//                     RESULTS
// ///////////////////////////////////////////////////////

// clear the results cards
function resetResultSliderTile() {
  let results_slider_tile = document.getElementById("results_slider_tile");
  results_slider_tile.innerHTML = "";
}
// When the results accordion is open we want to render the config results
document.addEventListener("DOMContentLoaded", function () {
  const resultsAccordion = document.getElementById("resultsAccordion");
  const radioButtons = document.querySelectorAll('input[name="renderOption"]');

  // Event listener for the accordion to just redraw or refresh data
  resultsAccordion.addEventListener("change", function () {
    if (this.checked && responseData !== null) {
      const selectedOption = document.querySelector(
        'input[name="renderOption"]:checked'
      ).value;
      drawGrid();
      displayResultsGrid(responseData, selectedOption);
    }
  });

  // General event listener for all radio buttons
  radioButtons.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      if (responseData !== null) {
        console.log("Radio option changed:", event.target.value);
        drawGrid();
        displayResultsGrid(responseData, event.target.value);
      } else {
        console.log("Data is not available yet.");
      }
    });
  });
});

// Creates the storage file in which to save the results
document
  .getElementById("downloadBtn")
  .addEventListener("click", function (event) {
    event.preventDefault(); // Prevent the default action

    if (!window.resultsText) {
      alert("No results to download! Click 'Calculate' to generate results.");
      return;
    }

    var blob = new Blob([window.resultsText], { type: "text/plain" });
    var downloadLink = document.createElement("a");
    downloadLink.download = "results.txt";
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  });

// creates the text file with the results
function resultstoTextFile(data) {
  // Function to pad strings to a specific length
  const padString = (str, length) => {
    return str.length < length ? str + " ".repeat(length - str.length) : str;
  };

  // Define the maximum length for each column
  const maxLengths = {
    type: 9, // 'joist' or 'beam'
    key: 9, // 'J0', 'B1', etc.
    size: 9, // '200x45', etc.
    spacing: 9,
    quantity: 9,
    length: 9,
    volume: 9,
    displacement: 9,
    ratio: 9,
  };

  // console.log(data.state_basic)
  // Process each row to align columns
  let textRows = Object.entries(data.state_basic)
    .map(([key, s], index) => {
      return [
        padString(s.type, maxLengths.type),
        padString(key, maxLengths.key),
        padString(s.size, maxLengths.size),
        padString(
          s.type === "joist" ? `${s.spacing}` : " - ",
          maxLengths.spacing
        ),
        padString(
          s.type === "beam" ? `${s.quantity}` : " - ",
          maxLengths.quantity
        ),
        padString(`${s.length}`, maxLengths.length),
        padString(`${s.volume.toFixed(3)}`, maxLengths.volume),
      ].join(" ");
    })
    .join("\n");

  let allowed = false;

  let configAllowed = data["Config allowed"];

  if (configAllowed) {
    // This will check for any truthy value
    allowed = true;
  }

  window.resultsText = `Time taken: ${responseData.time_taken} secs\n`;
  if (allowed) {
    window.resultsText += "Floor config is within constraints\n";
  } else {
    window.resultsText +=
      "Floor config not allowed, try changing the parameters\n";
  }

  window.resultsText += `Max End State Depth: ${data["Max end state depth"]} [mm]\n`;
  window.resultsText += `Total Volume: ${data["Total volume"].toFixed(
    3
  )} [m^3]\n\n`;

  window.resultsText += "*** Results Table: ***\n";
  window.resultsText +=
    "Type      Key       Size      Spacing   Quantity  Length    Volume    Disp.     Ratio\n";
  window.resultsText += textRows; // Use the processed rows
}

// Event listener for the calculate button
document.addEventListener("DOMContentLoaded", () => {
  const calculateButton = document.getElementById("calculate_btn");
  if (calculateButton) {
    calculateButton.addEventListener("click", () => {
      if (loadsData.length > 0) {
        callAPI();
      } else {
        alert("Please add loads before calculating.");
      }
    });
  }
});

// Event listener for the clear results button
document.addEventListener("DOMContentLoaded", () => {
  const clearButton = document.getElementById("clearBtn");
  clearButton.addEventListener("click", () => {
    resetInputs();
    calculateSpinner.classList.add("hidden");
    calculateBtn.disabled = false;
  });

});

// Event listener for render options
document.querySelectorAll('input[name="renderOption"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    console.log(responseData);
    if (responseData !== null) {
      // Check if responseData has been set
      const selectedOption = event.target.value;
      displayResultsGrid(responseData, selectedOption); // Use responseData here
    } else {
      console.log("Data is not available yet.");
    }
  });
});

// Displays the responsedata in both the results tile and in the results table
function displayResults(data) {
  let results_slider_tile = document.getElementById("results_slider_tile");

  let allowed = false;
  if (data["Config allowed"] === true) {
    allowed = true;
  }

  let color = allowed ? "green" : "red"; // Set color based on config allowed status

  let totalVolume = data["Total volume"].toFixed(3); // Ensure the volume is always to 3 decimal places

  results_slider_tile.innerHTML = `
    <h3>Total Volume: ${totalVolume} m3</h3>
    <p>Time taken: ${responseData.time_taken} secs</p>
    <p style="color: ${color}; font-weight: bold">${
    allowed
      ? "Floor config is within constraints"
      : "Floor config not allowed, try changing the parameters"
  }</p>
  `;

  // Results Legend
  let results_legend = document.getElementById("results_legend");

  // Start with the title
  let legendContent = "<h3>Legend</h3>";

  // Sort the entries by keys to ensure they are listed in order
  let sortedEntries = Object.entries(data.state_basic).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  // Generate the list items for each element
  sortedEntries.forEach(([key, element]) => {
    if (element.type === "joist") {
      legendContent += `<p>${key}: ${element.size} @ ${element.spacing}</p>`;
    } else if (element.type === "beam") {
      legendContent += `<p>${key}: ${element.quantity}x${element.size}</p>`;
    }
  });

  // Set the innerHTML of the legend div to the generated content
  results_legend.innerHTML = legendContent;

  // Generate stateRows HTML using the sorted entries
  let stateRows = sortedEntries
    .map(([key, s]) => {
      let spacing = s.type === "joist" ? `${s.spacing}` : ` - `;
      let quantity = s.type === "beam" ? `${s.quantity}` : ` - `;
      let volume = s.volume.toFixed(3); // Display volume to 3 decimal places
      let displacement = s.max_displacement.toFixed(3); // Ensure displacement exists before calling toFixed
      let length = s.length;
      let displacement_percent =
        (displacement / (length / maxRatio.value)) * 100;
      displacement_percent = displacement_percent.toFixed(3);

      let ratio = Math.round(s.min_displacement_ratio);
      let moment = s.max_moment * 1e-6;
      moment = moment.toFixed(3);
      let moment_percent = s.max_moment_ratio * 100;
      moment_percent = moment_percent.toFixed(3);
      let shear = s.max_shear * 1e-3;
      shear = shear.toFixed(3);
      let shear_percent = s.max_shear_ratio * 100;
      shear_percent = shear_percent.toFixed(3);

      return `
        <tr>
          <td class="px-4 py-2">${key}</td>
          <td class="px-4 py-2">${s.size}</td>
          <td class="px-4 py-2">${spacing}</td>
          <td class="px-4 py-2">${quantity}</td>
          <td class="px-4 py-2">${length}</td>
          <td class="px-4 py-2">${volume}</td>
          <td class="px-4 py-2">${displacement}</td>
          <td class="px-4 py-2">${displacement_percent}</td>
          <td class="px-4 py-2">1 / ${ratio}</td>
          <td class="px-4 py-2">${moment}</td>
          <td class="px-4 py-2">${moment_percent}</td>
          <td class="px-4 py-2">${shear}</td>
          <td class="px-4 py-2">${shear_percent}</td>
        </tr>
      `;
    })
    .join("");

  // Assuming you have an element with id="results" in your HTML
  let resultsDiv = document.getElementById("results");

  // Construct the table with stateRows
  let resultsHTML = `
    <h3 class="text-lg font-bold mb-4">Total Volume for option selected: ${totalVolume} m3</h3>
    <table class="table-auto w-full border-collapse">
      <thead>
        <tr class="bg-gray-200">
          <th class="px-4 py-2">ID</th>
          <th class="px-4 py-2">Size</th>
          <th class="px-4 py-2">Spacing</th>
          <th class="px-4 py-2">Qty</th>
          <th class="px-4 py-2">Length</th>
          <th class="px-4 py-2">Volume</th>
          <th class="px-4 py-2">Displacement</th>
          <th class="px-4 py-2">Utilization</th>
          <th class="px-4 py-2">Ratio</th>
          <th class="px-4 py-2">Moment</th>
          <th class="px-4 py-2">Utilization</th>
          <th class="px-4 py-2">Shear</th>
          <th class="px-4 py-2">Utilization</th>
        </tr>
        <tr>
          <th class="px-4 py-2"></th>
          <th class="px-4 py-2">[mm]</th>
          <th class="px-4 py-2">[mm]</th>
          <th class="px-4 py-2"></th>
          <th class="px-4 py-2">[mm]</th>
          <th class="px-4 py-2">[m3]</th>
          <th class="px-4 py-2">[mm]</th>
          <th class="px-4 py-2">[%]</th>
          <th class="px-4 py-2"></th>
          <th class="px-4 py-2">[kNm]</th>
          <th class="px-4 py-2">[%]</th>
          <th class="px-4 py-2">[kN]</th>
          <th class="px-4 py-2">[%]</th>
        </tr>
      </thead>
      <tbody>
        ${stateRows}
      </tbody>
    </table>
  `;

  // Set the innerHTML of the resultsDiv to the constructed resultsHTML
  resultsDiv.innerHTML = resultsHTML;
}

// ///////////////////////////////////////////////////////
// RESULTS CARDS
// ///////////////////////////////////////////////////////

// clear the response results config cards
function resetResponseCards() {
  responseData = null;
  // Clear the response cards before performing the API call
  const cardContainer = document.getElementById("responseCardsContainer");
  cardContainer.innerHTML = "";
}

// RESET ALL
// resets the config cards, the results card, and the results table
function resetInputs() {
  // Reset loads data
  loadsData = [];
  updateLoadsTextContainerDisplay(loadsData);
  // Redraw the grid or perform any other updates
  resetResponseCards();
  resetResultSliderTile();

  drawGrid();
}

// ///////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////
//                      API CALL
// ///////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////
export function callAPI() {
  const calculateBtn = document.getElementById("calculate_btn");
  const calculateSpinner = document.getElementById("calculate_spinner");

  // Show the spinner and disable the button
  console.log("Showing spinner and disabling button");
  calculateSpinner.classList.remove("hidden");
  calculateBtn.disabled = true;

  const x = document.getElementById("x").value;
  const y = document.getElementById("y").value;
  const maxDeflection = document.getElementById("maxDeflection").value;
  const maxRatio = document.getElementById("maxRatio").value;
  const maxDepth = document.getElementById("maxDepth").value;

  localStorage.clear();
  // Clear the response cards before performing the API call
  const cardContainer = document.getElementById("responseCardsContainer");
  cardContainer.innerHTML = "";

  let targetDepth = 0;
  const responses = JSON.parse(localStorage.getItem("apiResponses")) || [];

  function makeAPICall() {
    // instantiate a headers object
    var myHeaders = new Headers();
    // add content type header to object
    myHeaders.append("Content-Type", "application/json");
    // using built in JSON utility package turn object to string and store in a variable
    var raw = JSON.stringify({
      x: x,
      y: y,
      loads: loadsData,
      maxDeflection: maxDeflection,
      maxRatio: maxRatio,
      maxDepth: maxDepth,
      targetDepth: targetDepth,
    });

    // create a JSON object with parameters for API call and store in a variable
    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    // make API call with parameters and use promises to get response
    fetch(
      "https://gg10w11xt0.execute-api.eu-north-1.amazonaws.com/prod",
      requestOptions
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((data) => {
        try {
          const initialResponseData = JSON.parse(data); // Parse the initial JSON string
          responseData = JSON.parse(initialResponseData.body); // Parse the nested JSON string in 'body'
          console.log(responseData);
          // Append the response to the responses array
          responses.push(responseData);

          // Store the responses in local storage
          localStorage.setItem("apiResponses", JSON.stringify(responses));

          if (responseData.state_basic) {
            // Create the card HTML structure using template literals
            const cardHtml = `
              <div class="flex flex-col items-center space-y-2 mb-2 p-2 border border-gray-300 rounded-md">
                <label class="mb-1">State Length: ${
                  Object.keys(responseData.state_basic).length
                }</label>
                <input type="radio" aria-label="V: ${responseData[
                  "Total volume"
                ].toFixed(
                  3
                )}" name="responseCardRadio" class="btn bg-primary text-white w-full py-2 text-center cursor-pointer" data-index="${
              responses.length - 1
            }">
              </div>
            `;

            const card = document.createElement("div");
            card.innerHTML = cardHtml;
            const radio = card.querySelector('input[type="radio"]');
            cardContainer.appendChild(card);
            // Automatically select the newly created card
            radio.checked = true;

            // Trigger the click event to load the response data
            radio.click();
            
            radio.addEventListener("click", () => {
              const storedResponses = JSON.parse(
                localStorage.getItem("apiResponses")
              );
              responseData = storedResponses[radio.dataset.index]; // Update the global responseData variable
              drawGrid();
              displayResults(responseData);
              // Get the selected render option
              const selectedOption = document.querySelector(
                'input[name="renderOption"]:checked'
              ).value;
              displayResultsGrid(responseData, selectedOption); // Use the selected render option
              resultstoTextFile(responseData);
              console.log("Loaded responseData:", responseData);
            });
          } else {
            const cardHtml = `
              <div class="flex flex-col items-center space-y-2 mb-2 p-2 border border-gray-300 rounded-md">
                <label class="mb-1">No state found</label>
                <button class="btn" disabled="disabled">N/A</button>
              </div>
            `;

            const card = document.createElement("div");
            card.innerHTML = cardHtml;
            cardContainer.appendChild(card);
          }

          // Check if terminal depth is reached
          if (responseData.terminal_depth === true) {
            calculateSpinner.classList.add("hidden");
            calculateBtn.disabled = false;
          } else {
            targetDepth += 1;
            makeAPICall(); // Make the next API call
          }

          if (responseData.state_basic) {
            // Render the response
            drawGrid();
            console.log(`API call took ${responseData.time_taken} seconds.`); // Print the time taken
            displayResults(responseData);
            displayResultsGrid(responseData, "basic");
            resultstoTextFile(responseData);
          }
        } catch (error) {
          console.error("Error parsing response data:", error);
          console.error("Data causing the error:", data);
          calculateSpinner.classList.add("hidden");
          calculateBtn.disabled = false;
        }
      })
      .catch((error) => {
        console.log("Fetch error:", error);
        calculateSpinner.classList.add("hidden");
        calculateBtn.disabled = false;
      });
  }

  makeAPICall(); // Initial call to start the process
}

// ///////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////
//                   RENDERING RESULTS
// ///////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////
function renderConfigBasic(data) {
  let coordinates = getGridCoordinates();
  let canvas = document.getElementById("MCTS_floor_canvas");
  let ctx = canvas.getContext("2d"); // Access the grid parameters

  let { marginX, marginY, portWidth, portHeight, gridSizeY, maxX, maxY } =
    gridData();

  // console.log('state detailed', data.state_detailed)
  // Iterate over the state object entries
  Object.entries(data.state_detailed).forEach(([key, elements]) => {
    elements.forEach((element) => {
      let type = element.type;
      let cartesian_start, cartesian_end;
      // Determine start and end points based on the type of element
      cartesian_start = coordinates[element.start];
      cartesian_end = coordinates[element.end];

      // Access the direction from data.state using the key
      if (cartesian_start[1] === cartesian_end[1]) {
        cartesian_start[0] += 100;
        cartesian_end[0] += -100;
      } else {
        cartesian_start[1] += 100;
        cartesian_end[1] += -100;
      }

      ctx.beginPath();

      let startX = marginX + portWidth * (cartesian_start[0] / maxX);

      let startY =
        marginY + gridSizeY - portHeight * (cartesian_start[1] / maxY);

      let endX = marginX + portWidth * (cartesian_end[0] / maxX);

      let endY = marginY + gridSizeY - portHeight * (cartesian_end[1] / maxY);

      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);

      ctx.strokeStyle = type === "joist" ? "green" : "blue";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  });
}

function getColorForDisplacementRatio(ratio) {
  if (ratio < maxRatio.value) {
    // Return yellow for ratios less than 300
    return `rgb(255,255,0)`; // Yellow
  } else {
    // Normalize ratio value to [0, 1] within the range of deflection ratio to 1000
    let normalized = Math.min(
      Math.max((ratio - maxRatio.value) / (1000 - maxRatio.value), 0),
      1
    );
    // Linear interpolation between red (for normalized = 0) and blue (for normalized = 1)
    let r = (255 * (1 - normalized)).toFixed(0);
    let b = (255 * normalized).toFixed(0);
    return `rgb(${r},0,${b})`;
  }
}

function getColorForStrengthRatio(ratio) {
  if (ratio > 1) {
    // Return yellow for ratios less than 300
    return `rgb(255,255,0)`; // Yellow
  } else {
    // Normalize ratio value to [0, 1] within the range of 300 to 1000
    // Linear interpolation between red (for normalized = 0) and blue (for normalized = 1)
    let r = (255 * ratio).toFixed(0);
    let b = (255 * (1 - ratio)).toFixed(0);
    return `rgb(${r},0,${b})`;
  }
}

function renderDisplacement(data) {
  let coordinates = getGridCoordinates(); // Assuming this function returns an array of coordinates for nodes
  let canvas = document.getElementById("MCTS_floor_canvas");
  let ctx = canvas.getContext("2d");

  let { marginX, marginY, portWidth, portHeight, gridSizeY, maxX, maxY } =
    gridData();

  Object.entries(data.state_detailed).forEach(([key, elements]) => {
    elements.forEach((element) => {
      let nodes = element.nodes_on_line;
      let displacementRatios = element.displacement_ratio_list;

      for (let i = 0; i < nodes.length - 1; i++) {
        // Get the start and end node for this segment
        let startNode = nodes[i];
        let endNode = nodes[i + 1];

        // Get the coordinates for the start and end node
        let [startX, startY] = coordinates[startNode];
        let [endX, endY] = coordinates[endNode];

        // Adjust coordinates based on grid parameters
        startX = marginX + portWidth * (startX / maxX);
        startY = marginY + gridSizeY - portHeight * (startY / maxY);

        endX = marginX + portWidth * (endX / maxX);
        endY = marginY + gridSizeY - portHeight * (endY / maxY);

        // Calculate color based on the average displacement ratio of the two nodes
        let avgRatio = (displacementRatios[i] + displacementRatios[i + 1]) / 2;
        let color = getColorForDisplacementRatio(avgRatio);

        // Draw the segment
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  });
}

function renderStrength(data) {
  let coordinates = getGridCoordinates(); // Assuming this function returns an array of coordinates for nodes
  let canvas = document.getElementById("MCTS_floor_canvas");
  let ctx = canvas.getContext("2d");

  let { marginX, marginY, portWidth, portHeight, gridSizeY, maxX, maxY } =
    gridData();

  Object.entries(data.state_detailed).forEach(([key, elements]) => {
    elements.forEach((element) => {
      let nodes = element.nodes_on_line;
      let displacementRatios = element.moment_ratio_list;

      for (let i = 0; i < nodes.length - 1; i++) {
        // Get the start and end node for this segment
        let startNode = nodes[i];
        let endNode = nodes[i + 1];

        // Get the coordinates for the start and end node
        let [startX, startY] = coordinates[startNode];
        let [endX, endY] = coordinates[endNode];

        // Adjust coordinates based on grid parameters
        startX = marginX + portWidth * (startX / maxX);
        startY = marginY + gridSizeY - portHeight * (startY / maxY);

        endX = marginX + portWidth * (endX / maxX);
        endY = marginY + gridSizeY - portHeight * (endY / maxY);

        // Calculate color based on the average displacement ratio of the two nodes
        let avgRatio = (displacementRatios[i] + displacementRatios[i + 1]) / 2;
        let color = getColorForStrengthRatio(avgRatio);

        // Draw the segment
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  });
}

function annotateConfig(data) {
  let coordinates = getGridCoordinates();
  let canvas = document.getElementById("MCTS_floor_canvas");
  let ctx = canvas.getContext("2d"); // Access the grid parameters

  let { marginX, marginY, portWidth, portHeight, gridSizeY, maxX, maxY } =
    gridData();

  Object.entries(data.state_basic).forEach(([key, element]) => {
    const isJoist = element.type === "joist";

    let centerX, centerY;

    if (isJoist) {
      // For joists, calculate the center using all four node points to form a square
      const startCoord1 = coordinates[element.start[0]];
      const startCoord2 = coordinates[element.start[1]];
      const endCoord1 = coordinates[element.end[0]];
      const endCoord2 = coordinates[element.end[1]];
      centerX =
        (startCoord1[0] + startCoord2[0] + endCoord1[0] + endCoord2[0]) / 4;
      centerY =
        (startCoord1[1] + startCoord2[1] + endCoord1[1] + endCoord2[1]) / 4;
    } else {
      // For beams, calculate the center using just the start and end node points
      const startCoords = coordinates[element.start];
      const endCoords = coordinates[element.end];
      centerX = (startCoords[0] + endCoords[0]) / 2;
      centerY = (startCoords[1] + endCoords[1]) / 2;
    }

    // Adjust coordinates based on canvas dimensions and margins
    const adjustedCenterX = marginX + portWidth * (centerX / maxX);
    const adjustedCenterY = marginY + gridSizeY - portHeight * (centerY / maxY);

    // Prepare label properties
    const labelX = adjustedCenterX + 5; // Slight rightward offset for the label
    const labelY = adjustedCenterY + 5; // Slight downward offset for the label
    const labelText = `${key}`; // Use key as the label text

    // Set font size and style for measurement and drawing
    ctx.font = "16px Arial";

    // Measure the text
    const metrics = ctx.measureText(labelText);
    const textWidth = metrics.width;
    const textHeight = 14; // Approximation for text height; adjust as needed
    const padding = 4; // Padding around text

    // Calculate background rectangle coordinates and dimensions
    const backgroundX = labelX - padding / 2;
    const backgroundY = labelY - textHeight;
    const backgroundWidth = textWidth + padding;
    const backgroundHeight = textHeight + padding;

    // Set fill style for background and draw the rectangle
    ctx.fillStyle = "white"; // Color for the background
    ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight);

    // Now draw the text over the background
    ctx.fillStyle = "black"; // Set text color
    ctx.fillText(labelText, labelX, labelY); // Draw text
  });
}

// Renders whenever a radio button has been changed
document.querySelectorAll('input[name="renderOption"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    console.log(responseData);
    if (responseData !== null) {
      // Check if responseData has been set
      const selectedOption = event.target.value;
      displayResultsGrid(responseData, selectedOption); // Use responseData here
    } else {
      console.log("Data is not available yet.");
    }
  });
});

// renders a specific render option
function displayResultsGrid(data, selectedOption) {
  // Call the appropriate rendering function based on the selected radio button
  switch (selectedOption) {
    case "basic":
      renderConfigBasic(data);
      break;
    case "displacement":
      renderDisplacement(data);
      break;
    case "strength":
      renderStrength(data);
      break;
    default:
      console.error("Unknown render option selected");
  }

  // Optionally, annotate the configuration if needed
  annotateConfig(data);
}
