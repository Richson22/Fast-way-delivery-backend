require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const shipmentRoutes = require("./routes/shipments");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/shipments", shipmentRoutes);
const { router: adminRoutes } = require("./routes/admin");
app.use("/api/admin", adminRoutes);
const { router: userRoutes } = require("./routes/users");
app.use("/api/users", userRoutes);
app.use("/api/auth", userRoutes);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error(err));