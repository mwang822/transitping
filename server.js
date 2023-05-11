const express = require("express");
const { hostname } = require("os");
const path = require("path");
const app = express();
const port = 5070;

//app.use("/static",express.static(path.resolve(__dirname, "frontend", "static")));
app.use(express.static(path.resolve(__dirname, 'public', 'dist')));
app.use(express.static(path.resolve(__dirname, 'src', 'javascript')));

app.get("/*", (req, res) => {
  res.sendFile(path.resolve(__dirname,"public", "dist", "index.html"));
});
console.log(process.env.BUS_API_KEY);
app.listen(process.env.PORT || port, '0.0.0.0', () => console.log(`Server running on port ${port}...`));
