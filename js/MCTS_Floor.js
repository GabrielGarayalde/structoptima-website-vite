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

document.addEventListener("DOMContentLoaded", function () {
  const xSlider = document.getElementById("x");
  const ySlider = document.getElementById("y");

  // Function to handle slider changes
  function handleDimensionChange() {
    // Reset loads data
    loadsData = [];
    // Redraw the grid or perform any other updates
    drawGrid();
  }

  // Attach the event listeners
  xSlider.addEventListener("input", handleDimensionChange);
  ySlider.addEventListener("input", handleDimensionChange);
});

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
    showModal(); // Show the modal only if nodes have been selected
  }
  isDragging = false; // Reset dragging flag
});

document.getElementById('loadsAccordion').addEventListener('change', function() {
  if (this.checked) {
    console.log("Loads accordion is now open.");
    drawGrid(); // Redraw the grid
    renderLoadsOnCanvas(loadsData); // Update canvas rendering
  }
});


document.addEventListener('DOMContentLoaded', function() {
  const resultsAccordion = document.getElementById('resultsAccordion');
  const radioButtons = document.querySelectorAll('input[name="renderOption"]');

  // Event listener for the accordion to just redraw or refresh data
  resultsAccordion.addEventListener('change', function() {
    if (this.checked && responseData !== null) {
      console.log("Results accordion is now open.");
      const selectedOption = document.querySelector('input[name="renderOption"]:checked').value;
      drawGrid();
      displayResultsGrid(responseData, selectedOption);
    } else {
      console.log("Data is not available or accordion is not open.");
    }
  });

  // General event listener for all radio buttons
  radioButtons.forEach((radio) => {
    radio.addEventListener('change', (event) => {
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

function updateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas first
  drawGrid(); // Redraw the grid
  renderLoadsOnCanvas(loadsData); // Update canvas rendering
  highlightSelectedNodes(); // Highlight selected nodes
}

function renderLoadsOnCanvas(loads) {
  const { marginX, marginY, scaleX, scaleY, gridSizeY } = gridData(); // Reuse the gridData for canvas metrics
  const colors = ["red", "green", "blue", "purple", "orange"]; // Define a set of colors for different loads

  loads.forEach((load, index) => {
    const color = colors[index % colors.length]; // Cycle through colors for each load
    ctx.fillStyle = color;

    const x = marginX + load.start[0] * scaleX;
    const y = marginY + gridSizeY - load.start[1] * scaleY;
    const width = (load.end[0] - load.start[0]) * scaleX;
    const height = (load.start[1] - load.end[1]) * scaleY;

    // Draw the rectangle
    ctx.fillRect(x, y, width, height);

    // Draw the numerical identifier in the middle of the rectangle
    ctx.fillStyle = "white"; // Use white for better visibility
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Pressure ${index + 1}`, x + width / 2, y + height / 2);
  });
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

function highlightSelectedNodes() {
  var { marginX, marginY, scaleX, scaleY, gridSizeY } = gridData();

  ctx.fillStyle = "rgba(255, 0, 0, 0.5)"; // Semi-transparent red for selected nodes area

  if (selectedNodes.length === 0) {
    console.log("No nodes selected");
    return;
  }

  // Determine the bounds of the selected nodes
  let minX = Math.min(...selectedNodes.map((node) => node[0]));
  let maxX = Math.max(...selectedNodes.map((node) => node[0]));
  let minY = Math.min(...selectedNodes.map((node) => node[1]));
  let maxY = Math.max(...selectedNodes.map((node) => node[1]));

  // Calculate rectangle dimensions
  let rectWidth = (maxX - minX) * scaleX;
  let rectHeight = (maxY - minY) * scaleY;

  if (rectWidth === 0 || rectHeight === 0) {
    console.log("Selected area forms a line or a point, not a rectangle");
  } else {
    // Draw a rectangle that covers all selected nodes
    ctx.fillRect(
      marginX + minX * scaleX,
      marginY + gridSizeY - maxY * scaleY,
      rectWidth,
      rectHeight
    );

    // Assuming node coordinates are structured as [x, y]
    // Find the corners of the rectangle for the pressure area
    startNode = [minX, minY];
    endNode = [maxX, maxY];
  }
}

function showModal() {
  var modal = document.getElementById("loadModal"); // Ensure this ID matches your dialog's ID
  modal.showModal();
}

function closeModal() {
  var modal = document.getElementById("loadModal"); // Ensure this ID matches your dialog's ID
  modal.close();
}

document.addEventListener("DOMContentLoaded", (event) => {
  // Listener for the accept button
  const acceptBtn = document.getElementById("acceptButton");
  acceptBtn.addEventListener("click", acceptLoad);

  // Listener for the cancel button
  const cancelBtn = document.getElementById("cancelButton");
  cancelBtn.addEventListener("click", closeModal);
});

function acceptLoad() {
  const loadG = document.getElementById("loadInput1").value / 1000;
  const loadQ = document.getElementById("loadInput2").value / 1000;

  // Create a new load object
  const newLoad = {
    start: startNode,
    end: endNode,
    type: "pressure",
    G: parseFloat(loadG),
    Q: parseFloat(loadQ),
  };

  // Append new load to the data array
  loadsData.push(newLoad);
  // console.log(loadsData);
  // Update the UI or further process the data
  updateLoadsTextContainerDisplay(loadsData); // Assumes there's a function to update UI
  drawGrid();
  renderLoadsOnCanvas(loadsData); // Update canvas rendering
  closeModal(); // Close modal after accepting
}

function updateLoadsTextContainerDisplay(loadsData) {
  const loadsContainer = document.getElementById("loads-values-container");
  // Clear the existing contents of the container
  loadsContainer.innerHTML = "";

  // Loop through each load in the loadsData and create a row for each
  loadsData.forEach((load, index) => {
    const newRow = document.createElement("div");
    newRow.className = "grid grid-cols-4 gap-4 items-center"; // Updated for 4 columns

    newRow.innerHTML = `
          <div class="text-center">
              <span>Pressure ${index + 1}:</span>
          </div>
          <div class="text-center">${load.G * 1000} kPa</div>
          <div class="text-center">${load.Q * 1000} kPa</div>
          <div class="text-center">
              <button class="btn btn-error" id="deleteBtn-${index}">Delete</button>
          </div>
      `;

    loadsContainer.appendChild(newRow);

    // Add event listener to the delete button
    document
      .getElementById(`deleteBtn-${index}`)
      .addEventListener("click", function () {
        deleteLoad(index);
      });
  });
}

// Function to handle deletion of a load
function deleteLoad(index) {
  // Remove the load from the array
  loadsData.splice(index, 1);
  drawGrid(); // Redraw the grid

  // Update the UI
  updateLoadsTextContainerDisplay(loadsData);
  // Optionally update the canvas if necessary
  renderLoadsOnCanvas(loadsData);
}


// Save the results to a file
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

document.addEventListener("DOMContentLoaded", () => {
  const calculateButton = document.getElementById("calculate_btn");
  if (calculateButton) {
    calculateButton.addEventListener("click", () => callAPI());
  }
});

let responseData = null;

// callAPI function that takes the base and exponent numbers as parameters
export function callAPI() {
  const startTime = performance.now(); // Record start time

  const x = document.getElementById("x").value;
  const y = document.getElementById("y").value;
  const maxDeflection = document.getElementById("maxDeflection").value;
  const maxRatio = document.getElementById("maxRatio").value;
  const maxDepth = document.getElementById("maxDepth").value;

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
  });


  // console.log(raw);
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
    .then((response) => response.text())
    .then((data) => {
      const initialResponseData = JSON.parse(data); // Parse the initial JSON string
      responseData = JSON.parse(initialResponseData.body); // Parse the nested JSON string in 'body'

      drawGrid();

      const endTime = performance.now(); // Record end time
      let totalTime = (endTime - startTime) / 1000; // Calculate total time
      totalTime = totalTime.toFixed(3); // Round to 2 decimal places
      console.log(`API call took ${totalTime} seconds.`); // Print the time taken

      displayResults(responseData, totalTime);
      displayResultsGrid(responseData, "basic");
      resultstoTextFile(responseData, totalTime);
    })
    .catch((error) => console.log("error", error));
}

function resultstoTextFile(data, totalTime) {
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
        // padString(`${s.displacement.toFixed(3)}`, maxLengths.displacement),
        // padString(
        //   `1/${Math.round(s.length / s.displacement)}`,
        //   maxLengths.ratio
        // ),
      ].join(" ");
    })
    .join("\n");

  let allowed = false;
  if (
    data["Config allowed"] === true &&
    data["Within performance constraints"] === true
  ) {
    allowed = true;
  }

  window.resultsText = `Time taken: ${totalTime} secs\n`;
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
  // Rest of the code...
}

function displayResults(data, totalTime) {
  //  Results Slider Tile
  let results_slider_tile = document.getElementById("results_slider_tile");

  let allowed = false;
  if (
    data["Config allowed"] === true &&
    data["Within performance constraints"] === true
  ) {
    allowed = true;
  }

  let color = allowed ? "green" : "red"; // Set color based on config allowed status

  results_slider_tile.innerHTML = `
    <h3>Results</h3>
    <p>Time taken: ${totalTime} secs</p>
    <p style="color: ${color}; font-weight: bold">${
    allowed
      ? "Floor config is within constraints"
      : "Floor config not allowed, try changing the parameters"
  }</p>
  `;

  //   Results Legend
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

  // Generate stateRows HTML as provided
  let stateRows = Object.entries(data.state_basic)
    .map(([key, s]) => {
      let spacing = s.type === "joist" ? `${s.spacing}` : ` - `;
      let quantity = s.type === "beam" ? `${s.quantity}` : ` - `;
      let volume = s.volume.toFixed(3); // Display volume to 3 decimal places
      let displacement = s.max_displacement.toFixed(3); // Ensure displacement exists before calling toFixed

      let length = s.length;
      let ratio = Math.round(s.min_displacement_ratio);
      let moment = s.max_moment / 10e6;
      moment = moment.toFixed(3);
      let moment_percent = s.max_moment_ratio * 100;
      moment_percent = moment_percent.toFixed(3);
      let shear = s.max_shear / 10e3;
      shear = shear.toFixed(3);
      let shear_percent = s.max_shear_ratio * 100;
      shear_percent = shear_percent.toFixed(3);

      return `
        <tr>
          <td>${key}   </td>
          <td>${s.size}   </td>
          <td>${spacing}   </td>
          <td>${quantity}   </td>
          <td>${length}   </td>
          <td>${volume}  </td>
          <td>${displacement}</td>
          <td>1 / ${ratio}</td>
          <td>${moment}</td>
          <td>${moment_percent}</td>
          <td>${shear}</td>
          <td>${shear_percent}</td>

        </tr>
      `;
    })
    .join("");

  // Assuming you have an element with id="results" in your HTML
  let resultsDiv = document.getElementById("results");

  // Construct the table with stateRows
  let resultsHTML = `
    <table>
      <thead>
        <tr>
          <th>ID    </th>
          <th>Size    </th>
          <th>Spacing    </th>
          <th>Qty     </th>
          <th>Length   </th>
          <th>Volume    </th>
          <th>Displacement   </th>
          <th>Ratio    </th>
          <th>Moment    </th>
          <th>Utilization    </th>
          <th>Shear     </th>
          <th>Utilization    </th>

        </tr>
        <tr>
          <th>     </th>
          <th>[mm] </th>
          <th>[mm] </th>
          <th>     </th>
          <th>[mm] </th>
          <th>[mm3]</th>
          <th>[mm] </th>
          <th>     </th>
          <th>[kNm]</th>
          <th>[%]</th>
          <th>[kN] </th>
          <th>[%]</th>

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

// Call this function for each slider with its corresponding display element
updateSliderValue("x", "xValue");
updateSliderValue("y", "yValue");
updateSliderValue("maxDeflection", "maxDeflectionValue");
updateSliderValue("maxDepth", "maxDepthValue");
updateSliderValue("maxRatio", "maxRatioValue");

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
      let start, end;
      // Determine start and end points based on the type of element
      start = coordinates[element.start];
      end = coordinates[element.end];

      ctx.beginPath();

      let startX = marginX + portWidth * (coordinates[element.start][0] / maxX);

      let startY =
        marginY +
        gridSizeY -
        portHeight * (coordinates[element.start][1] / maxY);

      let endX = marginX + portWidth * (coordinates[element.end][0] / maxX);

      let endY =
        marginY + gridSizeY - portHeight * (coordinates[element.end][1] / maxY);

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
