import mongoose from "mongoose";
import dotenv from "dotenv";
import Pet from "./models/Pet.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://10.0.31.83:27017/petadopt-mongo";

const petsData = [
  // Pets from index.html with hardcoded _id values
  {
    _id: "670000000000000000000001",
    name: "Buddy",
    type: "Dog",
    species: "Dog",
    breed: "Golden Retriever",
    age: 2,
    behavior: "Loyal, playful, loves people",
    image: "https://images6.alphacoders.com/678/678636.jpg",
    description: "Buddy is a loyal companion who enjoys outdoor activities.",
    status: "available",
  },
  {
    _id: "670000000000000000000002",
    name: "Luna",
    type: "Cat",
    species: "Cat",
    breed: "Persian Cat",
    age: 1,
    behavior: "Calm, cuddly, indoor-friendly",
    image: "https://wallpapers.com/images/hd/kitten-pictures-gk8apx09lgy493tc.jpg",
    description: "Luna is affectionate and will brighten your home.",
    status: "available",
  },
  {
    _id: "670000000000000000000003",
    name: "Snowball",
    type: "Rabbit",
    species: "Rabbit",
    breed: "White Rabbit",
    age: 0.666, // Approximately 8 months
    behavior: "Gentle, curious, loves carrots",
    image: "https://hips.hearstapps.com/hmg-prod/images/rabbit-breeds-american-white-1553635287.jpg",
    description: "Snowball is gentle and perfect for families.",
    status: "available",
  },
  {
    _id: "670000000000000000000004",
    name: "Max",
    type: "Cat",
    species: "Cat",
    breed: "Black Cat",
    age: 0.666, // Approximately 8 months
    behavior: "Gentle, curious, friendly",
    image: "http://images.unsplash.com/photo-1552032345-a73a5d0462ac?ixlib=rb-1.2.1&q=80",
    description: "Max is a friendly cat who loves to explore.",
    status: "available",
  },
  {
    _id: "670000000000000000000005",
    name: "Sheru",
    type: "Dog",
    species: "Dog",
    breed: "White Dog",
    age: 1,
    behavior: "Gentle, curious, loyal",
    image: "https://i.redd.it/gh90i7i1pk531.jpg",
    description: "Sheru is a loyal and gentle dog, perfect for families.",
    status: "available",
  },
  {
    _id: "670000000000000000000006",
    name: "Balu",
    type: "Bear",
    species: "Bear",
    breed: "Polar Bear",
    age: 1,
    behavior: "Cuddly, playful, loves snow",
    image: "https://mir-s3-cdn-cf.behance.net/project_modules/fs/227db030885515.5637c92a73608.jpg",
    description: "Balu is a playful bear who loves cold environments.",
    status: "available",
  },
  // Pets from original seed.js with new _id values
  {
    _id: "670000000000000000000007",
    name: "Buddy Jr.",
    type: "Dog",
    species: "Dog",
    breed: "Labrador Retriever",
    age: 3,
    behavior: "Friendly and energetic, loves to play fetch.",
    image: "https://placedog.net/400/300?id=2",
    description: "Buddy Jr. is a loyal companion who enjoys outdoor activities.",
    status: "available",
  },
  {
    _id: "670000000000000000000008",
    name: "Mittens",
    type: "Cat",
    species: "Cat",
    breed: "Tabby",
    age: 2,
    behavior: "Calm and cuddly, enjoys sunny spots.",
    image: "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg",
    description: "Mittens is affectionate and will brighten your home.",
    status: "available",
  },
  {
    _id: "670000000000000000000009",
    name: "Coco",
    type: "Rabbit",
    species: "Rabbit",
    breed: "Mini Lop",
    age: 1,
    behavior: "Loves carrots and hopping around.",
    image: "https://hips.hearstapps.com/hmg-prod/images/rabbit-breeds-american-white-1553635287.jpg?crop=0.976xw:0.651xh;0.0242xw,0.291xh&resize=980:*",
    description: "Coco is gentle and perfect for families.",
    status: "available",
  },
  {
    _id: "67000000000000000000000A",
    name: "Polly",
    type: "Parrot",
    species: "Parrot",
    breed: "African Grey",
    age: 4,
    behavior: "Talkative and smart, mimics sounds.",
    image: "https://images.pexels.com/photos/1661179/pexels-photo-1661179.jpeg",
    description: "Polly is playful and will keep you entertained.",
    status: "available",
  },
  {
    _id: "67000000000000000000000B",
    name: "Nemo",
    type: "Fish",
    species: "Fish",
    breed: "Clownfish",
    age: 1,
    behavior: "Colorful and active swimmer.",
    image: "https://static.vecteezy.com/system/resources/previews/001/237/526/non_2x/close-up-of-a-blue-and-orange-betta-fish-free-photo.jpg",
    description: "Nemo brings life and beauty to your aquarium.",
    status: "available",
  },
  {
    _id: "67000000000000000000000C",
    name: "Shelly",
    type: "Turtle",
    species: "Turtle",
    breed: "Red-Eared Slider",
    age: 5,
    behavior: "Slow and steady, loves basking.",
    image: "http://photos.demandstudios.com/getty/article/223/12/100304366.jpg",
    description: "Shelly is calm and enjoys peaceful surroundings.",
    status: "available",
  },
];

(async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ MongoDB Connected");
    await Pet.deleteMany({});
    await Pet.insertMany(petsData);
    console.log("✅ Database seeded with pets");
    mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err.message);
    mongoose.connection.close();
    process.exit(1);
  }
})();