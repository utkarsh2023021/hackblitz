import mongoose from 'mongoose';
const { Schema } = mongoose;

const teacherSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
 
  classes: [{ type: Schema.Types.ObjectId, ref: 'Class' }]
});

export default mongoose.model('Teacher', teacherSchema);
