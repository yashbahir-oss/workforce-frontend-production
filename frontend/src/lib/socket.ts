import { io, type Socket } from "socket.io-client";
import { API } from "./api";

let socket: Socket | null = null;

const socketOrigin = () => API.replace(/\/api(?:\/v\d+)?\/?$/, "");

export function getSocket(): Socket {
  if (!socket) {
    socket = io(socketOrigin(), {
      autoConnect: false,
      transports: ["websocket", "polling"],
      withCredentials: true,
      auth: { token: localStorage.getItem("workforce_token") || "" },
    });
  }
  return socket;
}

export function connectSocket() {
  const s = getSocket();
  const token = localStorage.getItem("workforce_token") || "";
  s.auth = { token };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  socket?.disconnect();
}
