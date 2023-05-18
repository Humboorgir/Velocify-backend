import mongoose from "mongoose";
interface IUser {
  username: string;
  email: string;
  password: string;
}
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});
const userModel = mongoose.model<IUser>("user", userSchema);
export default userModel;
