const express = require("express");
const cors = require("cors");
require("dotenv").config();
const medicineRoutes = require("./routes/medicine");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/medicines", medicineRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
