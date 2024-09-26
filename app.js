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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
