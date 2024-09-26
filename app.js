const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());

// Make sure the uploads folder exists
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// Configure Multer to store JSON files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Filter to only accept JSON files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/json") {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Invalid file type. Only JSON files are allowed."), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Create POST route for file upload
app.post("/upload-json", upload.single("jsonfile"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded or invalid file type.");
  }

  res.send({
    message: "File uploaded successfully",
    file: req.file,
  });
});

// Create GET route
app.get("/get-json/:filename", (req, res) => {
  const filename = req.params.filename; // Get the filename from the request parameters
  const filePath = path.join(__dirname, "uploads", filename); // Construct the file path

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(404).send("File not found.");
    }

    try {
      const jsonData = JSON.parse(data); // Parse the JSON data
      res.json(jsonData); // Send the JSON data as the response
    } catch (parseError) {
      return res.status(400).send("Invalid JSON format.");
    }
  });
});

//Backend task
app.get("/", (req, res) => {
  const file = fs.readFileSync("./uploads/1727359804374-response.json");
  const data = file.toString() && JSON.parse(file.toString());
  const fuelEvents = [];

  let totalFuelConsumed = 0;

  data.sort((a, b) => a.timestamp - b.timestamp);

  let previousFuelLevel = data[0].fuel_level;

  for (let i = 1; i < data.length; i++) {
    const currentData = data[i];

    if (currentData.fuel_level > previousFuelLevel) {
      fuelEvents.push({
        start_time: new Date(data[i - 1].timestamp).toLocaleString(),
        end_time: new Date(currentData.timestamp).toLocaleString(),
        fuel_filed: currentData.fuel_level - previousFuelLevel,
        location: currentData.location,
      });
    }

    totalFuelConsumed += previousFuelLevel - currentData.fuel_level;
    previousFuelLevel = currentData.fuel_level;
  }

  res.json({ fuelEvents, totalFuelConsumed: totalFuelConsumed });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
