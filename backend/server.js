const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./src/routes/auth");
app.use("/auth", authRoutes);

const artistRoutes = require("./src/routes/artists"); 
app.use("/artists", artistRoutes); 

const albumRoutes = require("./src/routes/albums");
app.use("/albums", albumRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});