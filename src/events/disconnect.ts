import { Server, Socket } from "socket.io";
interface IO extends Server {
  IDs: Map<string, string>;
}
export default async function handler(io: IO, socket: Socket) {
  io.IDs.forEach((value, key) => {
    if (value === socket.id) io.IDs.delete(key);
  });
  console.table(io.IDs);
}
