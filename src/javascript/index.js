//const locationDiv = document.getElementById('location');
const responseDiv = document.getElementById('transitResponse');
const statusDiv = document.getElementById('status');
let transitURL = `https://transitping-mtapi.onrender.com/by-location`;
const mapsURL = `https://dev.virtualearth.net/REST/v1/Routes/walking`;
//console.log(document.getElementById('transitResponse');


// extract a function to get coordinates
function getCoordinates() {
  return new Promise(function(resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}




//function for getting mtapi data, returns essentially a promise
function getTransitData(coords){
  const params = new URLSearchParams();
  params.append(`lat`,coords.lat);
  params.append(`lon`,coords.lon);
  return fetch(`${transitURL}?${params.toString()}`);
}


//function for getting walk time

function getWalkTime(startCoords, endCoords) {
  const params = new URLSearchParams();
  params.append(`wayPoint.1`,`${startCoords.lat},${startCoords.lon}`);
  params.append(`wayPoint.2`,`${endCoords.lat},${endCoords.lon}`);
  params.append(`ra`,`routeSummariesOnly`);
  params.append(`key`, process.env.MAP_API_KEY);
  return fetch(`${mapsURL}?${params.toString()}`);
}

//function for display data

async function displayData() {
  let position = await getCoordinates();
  let transitData = await getTransitData({"lat":position.coords.latitude,"lon":position.coords.longitude});
  let data = await transitData.json();
  //console.log(data.data);
  

  data = data.data;
  //loop through data and format
  //

  let output = "";
  // iterate over the first 3 stations
  for (let i = 0; i < 3; i++) {
    let north, south, trainsN = {}, trainsS = {};
    north = data[i].N;
    south = data[i].S;
    walkTimeRes = await getWalkTime({
      "lat": position.coords.latitude,
      "lon": position.coords.longitude
    }, {"lat":data[i].location[0],"lon":data[i].location[1]});
    let timeJson = await walkTimeRes.json();
    let time = Math.round(timeJson.resourceSets[0].resources[0].travelDuration/60);


    // generate HTML for station
    output += `<div class="station ${data[i].name.toLowerCase().replace(/\s+/g, '-')}>`;
    output += `<p class="station-name">${data[i].name}&nbsp;&nbsp;&nbsp;&nbsp;&#128694;${time}mins</p>`;

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
      output += `<p>Route: ${route}&nbsp;&nbsp;&nbsp;ETA: ${eta} mins</p>`;

    }
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
  statusDiv.remove();
  responseDiv.innerHTML = `<div class="stations">${output}</div>`;
}


displayData().catch(error => statusDiv.innerHTML = error);





