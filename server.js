const express = require("express");
const { hostname } = require("os");
//const fetch = require("node-fetch");
//const fetch = import("node-fetch");
//import fetch from 'node-fetch';
const path = require("path");
const app = express();
const port = 5070;
const dotenv = require('dotenv');
dotenv.config();
const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));
//app.use("/static",express.static(path.resolve(__dirname, "frontend", "static")));
app.use(express.static(path.resolve(__dirname, 'public', 'dist')));
app.use(express.static(path.resolve(__dirname, 'src', 'javascript')));
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'https://bustime.mta.info, https://transitping1.onrender.com, http://localhost:5070');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.get('/data/nearby_bus', (req, res) => {
  const userLat = req.query.lat;
  console.log(userLat);
  const userLon = req.query.lon;
  const url = `http://bustime.mta.info/api/where/stops-for-location.json?lat=${userLat}&lon=${userLon}&latSpan=0.005&longSpan=0.005&key=${process.env.BUS_API_KEY}`;
  // Fetch request inside the Express route handler
  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      // send response to the client
      res.send(data);
    })
    .catch(error => {
      console.log(error);
      res.status(500).send('Error fetching remote resource');
  });
});
app.get('/data/bus_stop', (req, res) =>{
  const stopRef = req.query.MonitoringRef;
  const url = `https://bustime.mta.info/api/siri/stop-monitoring.json?version=2&StopMonitoringDetailLevel=minimum&MonitoringRef=${req.query.MonitoringRef}&key=${process.env.BUS_API_KEY}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      //console.log(data);
      //send response back to client
      res.send(data);
    }).catch(error => {
      console.log(error);
      res.status(500).send('Error fetching remote resource');
    });
});
app.get('/data/walk_time', (req,res) => {
  //console.log(req.query.wayPoint1);
  params = new URLSearchParams();
  params.append(`wayPoint.1`,req.query.wayPoint1);
  params.append(`wayPoint.2`,req.query.wayPoint2);
  params.append(`key`,`${process.env.MAP_API_KEY}`);
  const url = `https://dev.virtualearth.net/REST/v1/Routes/walking?${params.toString()}&ra=routeSummariesOnly`;
  console.log(url);
  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      res.send(data);

    }).catch(error => {
      console.log(error);
      res.status(500).send('Error fetching remote resource');
    });
});
app.get("/*", (req, res) => {
  res.sendFile(path.resolve(__dirname,"public", "dist", "index.html"));
});

app.listen(process.env.PORT || port, '0.0.0.0', () => console.log(`Server running on port ${port}...`));
