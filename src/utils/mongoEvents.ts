import chalk from "chalk";
import mongoose from "mongoose";
import mongoConnect from "./mongoconnect";
export default function loadMongoEvents(database: mongoose.Connection) {
  const mongoEvents = {
    connecting: () => {
      return "connecting...";
    },
    connected: () => {
      return "connected";
    },
    error: () => {
      mongoose.disconnect();
      return "error\n";
    },
    disconnected: () => {
      mongoConnect();
      return "disconnected\n" + "attempting to reconnect";
    },
  };
  for (const event in mongoEvents) {
    database.on(event, () => {
      console.log(
        `${chalk.green("[MongoDB Connection]:")} ${mongoEvents[
          event as keyof typeof mongoEvents
        ]()}`
      );
    });
  }
}
