//const locationDiv = document.getElementById('location');
const responseDiv = document.getElementById('transitResponse');
const statusDiv = document.getElementById('status');
let baseURL = `https://transitping-mtapi.onrender.com`;
console.log(process.env.MAP_API_KEY);
//console.log(document.getElementById('transitResponse');
const button = document.querySelectortor('#toggle-button');
button.addEventListener("click", toggleView);



//const container = document.querySelector('.container');
//let touchStartX = 0;
//let touchEndX = 0;


// extract a function to get coordinates
function getCoordinates() {
  return new Promise(function(resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function getWalkTime(startCoords, endCoords) {
  const mapsURL = `https://dev.virtualearth.net/REST/v1/Routes/walking`;
  const params = new URLSearchParams();
  params.append(`wayPoint.1`,`${startCoords.lat},${startCoords.lon}`);
  params.append(`wayPoint.2`,`${endCoords.lat},${endCoords.lon}`);
  params.append(`ra`,`routeSummariesOnly`);
  //REMOVE ON PROD
  params.append(`key`, process.env.MAP_API_KEY);
  console.log(`${mapsURL}?${params.toString()}`);
  let time = await fetch(`${mapsURL}?${params.toString()}`);
  return time;
}

// extract a function to display train data
function displayTrainData(data) {
  //let responseDiv = document.getElementById('transitResponse');
  let output = ""

  // iterate over the first 3 stations
  for (let i = 0; i < 3; i++) {
    let north, south, trainsN = {}, trainsS = {};
    north = data[i].N;
    south = data[i].S;
    //time = getWalkTime({
    //  "lat": userLat,
    //  "lon": userLon
    //}, {"lat":data[i].location[0],"lon":data[i].location[1]})
    //  .then(response => response.json())
    // .then(jsonData => {
    //    console.log(jsonData);
    //    time = Math.round(jsonData.resourceSets[0].resources[0].travelDuration/60);
        //document.getElementsByClassName("station-name")[i].innerHTML += `&nbsp;&nbsp;&nbsp;&nbsp;&#128694;${time}mins`;
        //responseDiv.innerHTML += `<p class=station-name>&#128694;${time}</p>`
    //  });
    //console.log(time)
    // generate HTML for station
    output += `<div class="station ${data[i].name.toLowerCase().replace(/\s+/g, '-')}">`;
    output += `<p class="station-name">${data[i].name}</p>`;

    // northbound trains
    output += `<div class="direction north">`;
    output += `<p>Northbound Trains</p>`;
    for (let i2 = 0; i2 < Math.min(4,north.length); i2++) {

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
        eta += `${trainsN[route][i]}, `;
        
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
    for (let i2 = 0; i2 < Math.min(4,south.length); i2++) {
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
        eta += `${trainsS[route][i]}, `;
      }
      eta = eta.substring(0,eta.length-2);
      
      output += `<p>Route: ${route}&nbsp;&nbsp;&nbsp;ETA: ${eta} mins</p>`;
    }
    output += `</div>`;
    output += `</div>`;
  }
  console.log(document.getElementById('transitResponse'));
  statusDiv.remove();
  responseDiv.innerHTML = `<div class="stations">${output}</div>`;
}


// call the functions
getCoordinates()
  .then(position => {
    userLat = position.coords.latitude;
    userLon = position.coords.longitude;
    statusDiv.innerHTML = `Getting location`;
    let { latitude, longitude } = position.coords;
    return fetch(`${baseURL}/by-location?lat=${latitude}&lon=${longitude}`);
  }).then(response => response.json())
  .then(jsonData => {
    displayTrainData(jsonData.data);
  })
  .catch(error => console.log(error));
