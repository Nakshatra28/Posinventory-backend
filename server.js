require("dotenv").config();
const connectDB = require("./config/db");

const express = require("express");
const cors = require("cors");

const app = express();

// Connect to DB
connectDB();

// Enable CORS (MUST be before routes)
app.use(
  cors({
    origin: "http://localhost:4200",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware to read JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/customer", require("./routes/customerRoutes"));
app.use("/api/supplier", require("./routes/supplierRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/accounts", require("./routes/accountRoutes"));
app.use("/api/audit-logs", require("./routes/auditLogRoutes"));

// Default route (just to test)
app.get("/", (req, res) => {
  res.send("POS Inventory Backend Running...");
});
app.use("/api/invoice", require("./routes/invoiceRoutes"));

app.use("/api/purchase-orders", require("./routes/purchaseOrderRoutes"));

app.use("/api/audit", require("./routes/auditSummaryRoutes"));

app.use("/api/stock-movements", require("./routes/stockMovementRoutes"));

// app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/auth", require("./routes/auth.routes"));
// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
