import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { body, param, validationResult } from "express-validator";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "http://10.0.11.184:9090" }));
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://10.0.31.83:27017/petadopt-mongo";
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");

// MongoDB Connection
mongoose
  .connect(MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

// Models
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, trim: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const User = mongoose.model("User", UserSchema);

const PetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["Dog", "Cat", "Rabbit", "Parrot", "Fish", "Turtle", "Bear", "Other"], default: "Other" },
    species: { type: String, trim: true },
    breed: { type: String, trim: true },
    age: { type: Number, min: 0 },
    behavior: { type: String, trim: true },
    image: { type: String, trim: true },
    description: { type: String, trim: true },
    status: { type: String, enum: ["available", "adopted"], default: "available" },
    adoptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);
const Pet = mongoose.model("Pet", PetSchema);

const ApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    message: { type: String, trim: true },
    appliedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);
const Application = mongoose.model("Application", ApplicationSchema);

// Middleware
const auth = (req, res, next) => {
  if (!JWT_SECRET) {
    console.error("❌ Auth middleware: JWT_SECRET is not defined");
    return res.status(500).json({ error: "Server configuration error" });
  }
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    console.error("❌ Auth middleware: No token provided");
    return res.status(401).json({ error: "No token provided" });
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("❌ Auth middleware: Invalid token", err.message);
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

const admin = async (req, res, next) => {
  if (!req.user) {
    console.error("❌ Admin middleware: No user in request");
    return res.status(401).json({ error: "Authentication required" });
  }
  const user = await User.findById(req.user.id);
  if (!user || !user.isAdmin) {
    console.error(`❌ Admin middleware: User ${req.user.id} lacks admin privileges`);
    return res.status(403).json({ error: "Admin access required" });
  }
  req.user = user; // Update req.user with full user document
  next();
};

// Auth Routes
app.post(
  "/api/auth/register",
  [
    body("name").notEmpty().withMessage("Name is required").trim(),
    body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { name, email, password } = req.body;
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ error: "Email already registered" });
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed });
      res.json({ message: "User registered successfully", userId: user._id });
    } catch (err) {
      console.error("❌ Registration error:", err.message);
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

app.post(
  "/api/auth/login",
  [
    body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: "Invalid credentials" });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ error: "Invalid credentials" });
      const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "1d" });
      res.json({ message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
    } catch (err) {
      console.error("❌ Login error:", err.message);
      res.status(500).json({ error: "Login failed" });
    }
  }
);

// Pets Routes
app.get("/api/pets", async (req, res) => {
  try {
    const pets = await Pet.find();
    res.json(pets);
  } catch (err) {
    console.error("❌ Error fetching pets:", err.message);
    res.status(500).json({ error: "Failed to fetch pets" });
  }
});

app.post(
  "/api/pets",
  auth,
  admin,
  [
    body("name").notEmpty().withMessage("Name is required").trim(),
    body("type").isIn(["Dog", "Cat", "Rabbit", "Parrot", "Fish", "Turtle", "Bear", "Other"]).withMessage("Invalid pet type"),
    body("age").optional().isInt({ min: 0 }).withMessage("Age must be a positive integer"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { name, type, species, breed, age, behavior, image, description } = req.body;
      const pet = await Pet.create({
        name,
        type,
        species,
        breed,
        age,
        behavior,
        image,
        description,
        status: "available",
      });
      res.json({ message: "Pet created successfully", petId: pet._id });
    } catch (err) {
      console.error("❌ Error creating pet:", err.message);
      res.status(500).json({ error: "Failed to create pet" });
    }
  }
);

app.post("/api/pets/:id/adopt", auth, async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: "Pet not found" });
    if (pet.status === "adopted") return res.status(400).json({ error: "This pet is already adopted" });
    pet.status = "adopted";
    pet.adoptedBy = req.user.id;
    await pet.save();
    res.json({ message: "Pet adopted successfully!", pet });
  } catch (err) {
    console.error("❌ Error adopting pet:", err.message);
    res.status(500).json({ error: "Failed to adopt pet" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});