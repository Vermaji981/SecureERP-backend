const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorMiddleware");

// Load environment variables
dotenv.config();

const app = express();

// ===============================
// Database Connection
// ===============================
connectDB();

// ===============================
// Security Middleware
// ===============================
app.use(helmet());

// ===============================
// CORS Configuration
// ===============================
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin (Postman, server-to-server, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS")
      );
    },
    credentials: true,
  })
);

// ===============================
// Body Parser
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// Logger
// ===============================
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ===============================
// Rate Limiter
// ===============================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message:
      "Too many authentication requests from this IP, please try again after 15 minutes.",
  },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ===============================
// ROOT ROUTE
// ===============================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SecureERP Backend is running successfully",
    environment: process.env.NODE_ENV || "development",
  });
});

// ===============================
// HEALTH CHECK
// ===============================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SecureERP API Server is operational",
    timestamp: new Date().toISOString(),
  });
});

// ===============================
// API ROUTES
// ===============================

app.use(
  "/api/auth",
  require("./routes/authRoutes")
);

app.use(
  "/api/employees",
  require("./routes/employeeRoutes")
);

app.use(
  "/api/departments",
  require("./routes/departmentRoutes")
);

app.use(
  "/api/products",
  require("./routes/productRoutes")
);

app.use(
  "/api/inventory",
  require("./routes/inventoryRoutes")
);

app.use(
  "/api/suppliers",
  require("./routes/supplierRoutes")
);

app.use(
  "/api/customers",
  require("./routes/customerRoutes")
);

app.use(
  "/api/purchases",
  require("./routes/purchaseRoutes")
);

app.use(
  "/api/sales",
  require("./routes/salesRoutes")
);

app.use(
  "/api/invoices",
  require("./routes/invoiceRoutes")
);

app.use(
  "/api/attendance",
  require("./routes/attendanceRoutes")
);

app.use(
  "/api/leaves",
  require("./routes/leaveRoutes")
);

app.use(
  "/api/expenses",
  require("./routes/expenseRoutes")
);

app.use(
  "/api/payroll",
  require("./routes/payrollRoutes")
);

app.use(
  "/api/reports",
  require("./routes/reportRoutes")
);

app.use(
  "/api/audit-logs",
  require("./routes/auditLogRoutes")
);

app.use(
  "/api/notifications",
  require("./routes/notificationRoutes")
);

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ===============================
// ERROR HANDLER
// ===============================
app.use(errorHandler);

// ===============================
// LOCAL SERVER
// ===============================
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(
      `[SecureERP Server] Running in ${
        process.env.NODE_ENV || "development"
      } mode on port ${PORT}`
    );
  });
}

// ===============================
// UNHANDLED REJECTION
// ===============================
process.on("unhandledRejection", (err) => {
  console.error(
    `Unhandled Rejection Error: ${err.message}`
  );
});

// Export app for Vercel
module.exports = app;