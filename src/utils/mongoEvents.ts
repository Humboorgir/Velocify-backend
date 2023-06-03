import chalk from "chalk";
import mongoose from "mongoose";
import mongoConnect from "./mongoconnect";
export default function loadMongoEvents(database: mongoose.Connection) {
  const mongoEvents = {
    connecting: () => {
      return "Connecting...";
    },
    connected: () => {
      return "Connected";
    },
    error: () => {
      mongoose.disconnect();
      return "Error\n";
    },
    disconnected: () => {
      mongoConnect();
      return "Disconnected\n" + "attempting to reconnect";
    },
  };
  for (const event in mongoEvents) {
    database.on(event, () => {
      console.log(
        `${chalk.green("[MongoDB Connection]")} ${mongoEvents[
          event as keyof typeof mongoEvents
        ]()}`
      );
    });
  }
}
