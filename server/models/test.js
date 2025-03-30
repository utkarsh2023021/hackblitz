// models/test.js
import mongoose from "mongoose";

const TestSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  topic: { type: String, required: true },
  type: { type: String, required: true },
  level: { type: String, required: true },
  numberOfQuestions: { type: Number, required: true },
  questions: { type: Array, required: true },
  teacherId: { type: String, required: true },
  attemptedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of student IDs
  createdAt: { type: Date, default: Date.now },
  time: { type: Number, required: true},
});

export default mongoose.model("Test", TestSchema);