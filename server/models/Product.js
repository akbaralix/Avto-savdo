import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    index: true
  },
  model: {
    type: String,
    required: true,
    index: true
  },
  year: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  mileage: {
    type: Number,
    required: true
  },
  transmission: {
    type: String,
    required: true,
    enum: ["Avtomat", "Mexanika"]
  },
  fuel: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    default: [],
    validate: [arrayLimit, "{PATH} exceeds the limit of 10 images"]
  },
  engineVolume: {
    type: String,
    default: "1.5 L"
  },
  color: {
    type: String,
    default: "Oq"
  },
  description: {
    type: String,
    default: ""
  },
  ownerPhone: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

function arrayLimit(val) {
  return val.length <= 10;
}

const Product = mongoose.model("Product", productSchema);
export default Product;
