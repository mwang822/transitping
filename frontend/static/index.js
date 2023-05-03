let locationDiv = document.getElementById('location')
let responseDiv = document.getElementById('transitResponse')
let baseURL = `https://transitping-mtapi.onrender.com`

// extract a function to get coordinates
function getCoordinates() {
  return new Promise(function(resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

// extract a function to display train data
function displayTrainData(data) {

  let output = "";

  // iterate over the first 3 stations
  for (let i = 0; i < 3; i++) {
    let north, south, trainsN = {}, trainsS = {};
    north = data[i].N;
    south = data[i].S;

    // generate HTML for station
    output += `<div class="station ${data[i].name.toLowerCase().replace(/\s+/g, '-')}">`;
    output += `<p class="station-name">${data[i].name}</p>`;

    // northbound trains
    output += `<div class="direction north">`;
    output += `<p>Northbound Trains</p>`;
    for (let i2 = 0; i2 < 4; i2++) {
      let minsN = Math.round((new Date(north[i2].time) - Date.now()) / (1000 * 60));
      // update northbound trains object
      if (!(data[i].N[i2].route in trainsN)) {
        trainsN[data[i].N[i2].route] = [minsN];
      } else {
        trainsN[data[i].N[i2].route].push(minsN);
      }
    }
    for (var route in trainsN) {
      let eta = ""
      
      //formatting same route North trains on same line
      for (let i = 0; i < trainsN[route].length; i++) {
        eta += `${trainsN[route][i]} ,`;
        
      }
      eta = eta.substring(0,eta.length-2);
      //console.log(eta)
      output += `<p>Route: ${route}&nbsp;&nbsp;&nbsp;ETA: ${eta} mins</p>`;

    }
    //console.log(trainsN)
    output += `</div>`;

    // southbound trains
    output += `<div class="direction south">`;
    output += `<p>Southbound Trains</p>`;
    for (let i2 = 0; i2 < 4; i2++) {
      let minsS = Math.round((new Date(south[i2].time) - Date.now()) / (1000 * 60));
      // update southbound trains object
      if (!(south[i2].route in trainsS)) {
        trainsS[south[i2].route] = [minsS];
      } else {
        trainsS[south[i2].route].push(minsS);
      }
      //output += `<p>Route: ${south[i2].route}, ETA: ${minsS} mins</p>`;
    }
    for (var route in trainsS) {
      let eta = ""

      //formatting same route & dir ETA on one line
      for (let i = 0; i < trainsS[route].length; i++) {
        eta += `${trainsS[route][i]} ,`;
      }
      eta = eta.substring(0,eta.length-2);
      
      output += `<p>Route: ${route}&nbsp;&nbsp;&nbsp;ETA: ${eta} mins</p>`;
    }
    output += `</div>`;
    output += `</div>`;
  }

  responseDiv.innerHTML = `<div class="stations">${output}</div>`;
}


// call the functions
getCoordinates()
  .then(position => {
    let { latitude, longitude } = position.coords;
    return fetch(`${baseURL}/by-location?lat=${latitude}&lon=${longitude}`);
  }).then(response => response.json())
  .then(jsonData => {
    displayTrainData(jsonData.data);
  })
  .catch(error => console.log(error));
