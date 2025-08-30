// backend/src/models/Pet.js
import mongoose from "mongoose";

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

export default Pet;