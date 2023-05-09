const trainResDiv = document.getElementById('trainResponse');
const busResDiv = document.getElementById('busResponse');
const statusDiv = document.getElementById('status');
let transitURL = `https://transitping-mtapi.onrender.com/by-location`;
const mapsURL = `https://dev.virtualearth.net/REST/v1/Routes/walking`;


function toggleView() {
    const trainView = document.querySelector(".train-view");
    const busView = document.querySelector(".bus-view");

    if (trainView.style.display === 'none'){
    trainView.style.display = 'block';
    busView.style.display = 'none';
  } else {
    trainView.style.display = 'none';
    busView.style.display = 'block';
  }
}
 
const button = document.querySelector('#toggle-button');
button.addEventListener("click", toggleView);



// extract a function to get coordinates
function getCoordinates() {
  return new Promise(function(resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}




//function for getting mtapi data, returns essentially a promise
function getTrainData(coords){
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

//extract train times from keys to to String 
function getStringETA(trains) {
  res = ""
  for (var route in trains) {
      let eta = ""
      
      //formatting same route North trains on same line
      for (let i = 0; i < Math.min(trains[route].length,4); i++) {
        eta += `${trains[route][i]}, `;
      }

      eta = eta.substring(0,eta.length-2);
      res += `<p>Route: ${route}&nbsp;&nbsp;&nbsp;ETA: ${eta} mins</p>`;
    }

  return res;

}

async function getBusData(coords){
  const busStopsURL = 'https://bustime.mta.info/api/where/stops-for-location.json';
  const busStopQueryURL = 'https://bustime.mta.info/api/siri/stop-monitoring.json';
  params = new URLSearchParams();
  params.append(`lat`, `${coords.lat}`);
  params.append(`lon`, `${coords.lon}`);

  params.append(`latSpan`, 0.005);
  params.append(`longSpan`, 0.005);
  params.append('key', process.env.BUS_API_KEY);
  nearbyStops = await (await fetch(`${busStopsURL}?${params.toString()}`)).json();
  nearbyStops = nearbyStops.data.stops;
  console.log(nearbyStops);
  const stops = {};
  for (let i = 0; i < Math.min(4,nearbyStops.length); i++){
    //stops.push(nearbyStops[i].code);
    params = new URLSearchParams();
    params.append('version',2);
    params.append('StopMonitoringDetailLevel','minimum');
    params.append('key', process.env.BUS_API_KEY);
    params.append('MonitoringRef',nearbyStops[i].code);
    stopRes = await fetch(`${busStopQueryURL}?${params.toString()}`)
    stopRes = await stopRes.json();
    //console.log(stopRes);
    stopRes = stopRes.Siri.ServiceDelivery.StopMonitoringDelivery[0].MonitoredStopVisit;
    //console.log(stopRes);
    stops[nearbyStops[i].name]=stopRes;
  }
  return stops;
}





//function for display data

async function displayData() {
  let position = await getCoordinates();
  userCoords = {"lat":position.coords.latitude,"lon":position.coords.longitude};
  statusDiv.innerHTML = `Got user location! Getting transit data...`
  let transitData = await getTrainData(userCoords);
  let data = await transitData.json();
  data = data.data;
  //getBusData(userCoords);
  
  //loop through data and format
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
    //output += `<div class="content ${data[i].name.toLowerCase().replace(/\s+/g, '-')}">`;
    output += `<h2 class="station-name">${data[i].name}&nbsp;&nbsp;&nbsp;&nbsp;&#128694;${time}mins</h2>`;
  
    // northbound trains
    output += `<div class="direction north">`;
    output += `<p>Northbound Trains</p>`;
    for (let i2 = 0; i2 < north.length; i2++) {

      let minsN = Math.round((new Date(north[i2].time) - Date.now()) / (1000 * 60));
      // update northbound trains object
      if (!(data[i].N[i2].route in trainsN)) {
        trainsN[data[i].N[i2].route] = [minsN];
      } else {
        trainsN[data[i].N[i2].route].push(minsN);
      }
    }
    output += getStringETA(trainsN);
    //output += `</div>`;

    // southbound trains
    output += `<div class="direction south">`;
    output += `<p>Southbound Trains</p>`;
    for (let i2 = 0; i2 < south.length; i2++) {
      let minsS = Math.round((new Date(south[i2].time) - Date.now()) / (1000 * 60));
      // update southbound trains object
      if (!(south[i2].route in trainsS)) {
        trainsS[south[i2].route] = [minsS];
      } else {
        trainsS[south[i2].route].push(minsS);
      }
    }
    
    output += getStringETA(trainsS)
    output += `</div>`;
    output += `</div>`;
  }
  statusDiv.remove();
  trainResDiv.innerHTML = `${output}`;
  
  //updating buses
  output = `<h1>Nearby Bus Stops</h1>`;
  busData = await getBusData(userCoords);
  upcomingBuses = {};

  //aggregate all fetched bus data into upcoming buses, merge by routes
  for (let busStop in busData){
    upcomingBuses[busStop] = {};
    console.log(busData[busStop]);
    for (let i = 0; i < busData[busStop].length; i++){
      bus_i = busData[busStop][i].MonitoredVehicleJourney;
      if (!(bus_i.PublishedLineName[0] in upcomingBuses[busStop])){
        upcomingBuses[busStop][bus_i.PublishedLineName[0]] = [[bus_i.DestinationName[0]],[bus_i.MonitoredCall.ArrivalProximityText]];
        console.log(upcomingBuses);
      } else {
        upcomingBuses[busStop][bus_i.PublishedLineName[0]][1].push(bus_i.MonitoredCall.ArrivalProximityText);
      }
    }
  }

  //format output bus data
  for (let nearbyStop in upcomingBuses){
    output += `<div class="station">`;
    output += `<h2>${nearbyStop}</h2>`;
    for (let bus in upcomingBuses[nearbyStop]){
      output += `<p>${bus} ---> ${upcomingBuses[nearbyStop][bus][0]}</p>`;
      eta = "";

      for (let i = 0; i < Math.min(3,upcomingBuses[nearbyStop][bus][1].length); i++){
        eta += `${upcomingBuses[nearbyStop][bus][1][i]}, `;
      }
      output += `<p>ETA: ${eta.substring(0,eta.length-2)}</p>`;
    }
    output += `</div>`;
    console.log(output)
  }
  busResDiv.innerHTML = output;
}


displayData().catch(error => statusDiv.innerHTML = error);





