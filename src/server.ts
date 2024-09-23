import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import bodyParser from "body-parser";
import multer from "multer";
import compression from "compression";
import rateLimit from "express-rate-limit";
import "colors";
import { body, validationResult } from "express-validator";
import passport from "passport";

// Initialize express app
const app = express();

// Middlewares
app.use(cors()); // Enable CORS
app.use(helmet()); // Security headers
app.use(morgan("dev")); // Request logging
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(compression()); // Enable compression

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  next();
});

// Rate Limiter - Limit repeated requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
});
app.use(limiter);

// Multer for file uploads
const upload = multer({ dest: "uploads/" });
app.post("/upload", upload.single("file"), (req: Request, res: Response) => {
  res.send("File uploaded successfully.");
});

// Express Validator for input validation
app.post(
  "/user",
  [body("email").isEmail(), body("password").isLength({ min: 5 })],
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.send("User is valid");
  }
);

// Passport for authentication
app.use(passport.initialize());

// Routes

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`.yellow.bold);
});

export default app;
