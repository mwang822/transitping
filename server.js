const express = require("express");
const path = require("path");
const app = express();
const port = 5070;

//app.use("/static",express.static(path.resolve(__dirname, "frontend", "static")));
app.use(express.static(path.resolve(__dirname, 'public', 'dist')));
app.use(express.static(path.resolve(__dirname, 'src', 'javascript')));

app.get("/*", (req, res) => {
  res.sendFile(path.resolve(__dirname,"public", "dist", "index.html"));
});

app.listen(process.env.PORT || port, () => console.log(`Server running on port ${port}...`));
