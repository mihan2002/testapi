// Import required modules
const express = require("express");

// Create an instance of Express
const app = express();

// Define a route for the '/api' endpoint
app.get("/api", (req, res) => {
  res.send("whatsa up my bruh");
});

// Define a route for the '/api/node' endpoint
app.get("/api/node", (req, res) => {
  res.send("You did nigga it!");
});
app.get("/api/dew", (req, res) => {
    res.send("oya kavada halo ");
  });
app.get("/api/saki", (req, res) => {
    res.send("podi kariya");
  });

// Define a port for the server to listen on
const PORT = process.env.PORT || 5000;

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Printing the link
  console.log(`Access the server at: http://localhost:${PORT}`);
});
