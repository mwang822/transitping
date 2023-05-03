let quotesDiv = document.getElementById('quotes');

let locationDiv = document.getElementById('location')
let responseDiv = document.getElementById('transitResponse')


const successCallback = (position) => {
  let lat = position.coords.latitude
  let lon = position.coords.longitude
	locationDiv.innerHTML += `<p>latitude: ${lat}, longitude: ${lon} </p>`;
	console.log(position);
	fetch(`http://localhost:5000/by-location?lat=${lat}&lon=${lon}`)
  .then(response => response.json())
  .then(data => {
    //responseDiv.innerHTML = `<h3>${data.data[0].N}<br>${data.data[0].S}</h3`
    console.log(data.data[0].N);
    console.log(data.data[0].S)
  }).catch(error => {
      console.log(error)
    });
};

const errorCallback = (error) => {
	locationDiv.innerHTML += `<p> ${error} </p>`
};

navigator.geolocation.getCurrentPosition(successCallback, errorCallback);


function getCoordinates() {
  return new Promise(function(resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

//let transitURL = `http://localhost:5000/by-location?lat=${latitude}&lon=${longitude}`
this.getCoordinates()
  .then(position => {

    let {latitude, longitude} = position.coords;
    //lat = position.coords.latitude;
    //lon = position.coords.longitude;

    return fetch(`http://localhost:5000/by-location?lat=${latitude}&lon=${longitude}`);
  }).then(response => response.json())
  .then(jsonData => {
    let data = jsonData.data
    for (let i = 0; i<2; i++){
      console.log(jsonData.data[i]);
      north = data[i].N;
      south = data[i].S;
      trainsN = {};
      trainsS = {};
      responseDiv.innerHTML += `<p>Station : ${data[i].name}</p>`
      for (let i2 = 0; i2<4; i2++){
        let minsN = Math.round((new Date(north[i2].time) - Date.now())/(1000*60));
        let minsS = Math.round((new Date(south[i2].time) - Date.now())/(1000*60));
        if (!(data[i].N[i2].route in trainsN)){
          //console.log("not in")
          trainsN[data[i].N[i2].route] = [minsN];
        } else {
          trainsN[data[i].N[i2].route].push(minsN);
        }
        if (!(south[i2].route in trainsS)) {
          trainsS[south[i2].route] = [minsS];
        } else {
          trainsS[south[i2].route].push(minsS);
        }

        //responseDiv.innerHTML += `<p>Direction: North<pre>Route:${data[i].N[i2].route}    Time:${minsN} mins</p>`
        //responseDiv.innerHTML += `<p>Direction: South<pre>Route:${data[i].S[i2].route}    Time:${minsS} mins</p>`
        //console.log((new Date(data[i].N[i2].time) - Date.now())/(1000*60));
      }

      //update output for northbound trains
      responseDiv.innerHTML += `<p>Direction: North`
      for (var route in trainsN) {
        //console.log(route, trainsN[route]);
        out = ""
        for (let i = 0; i < trainsN[route].length; i++){
          if (i == trainsN[route].length-1){
            out += `${trainsN[route][i]}`
          } else {
            out += `${trainsN[route][i]}, ` 
          }
        }
        responseDiv.innerHTML += `<pre>Route:${route}   ETA:${out} mins`
      }
      responseDiv.innerHTML += `</p>`

      //update output for southbound trains
      responseDiv.innerHTML += `<p>Direction: South`
      for (var route in trainsS) {
        out = ""
        for (let i = 0; i < trainsS[route].length; i++){
          if (i == trainsS[route].length-1){
            out += `${trainsS[route][i]}`
          } else {
            out += `${trainsS[route][i]}, ` 
          }
        }
        responseDiv.innerHTML += `<pre>Route:${route}   ETA:${out} mins`
      }
      responseDiv.innerHTML += `</p>`
    }
    //console.log(jsonData.data.length)
  })
  .catch(error => console.log(error));
