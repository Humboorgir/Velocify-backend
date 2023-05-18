import mongoose, { ConnectOptions } from "mongoose";
export default function mongoConnect(): void {
  mongoose
    .connect("mongodb://127.0.0.1/velocify", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions)
    .then(() => {
      console.log("connected to mongoose!");
    });
  // TODO: remove then() in production
}
