import {prismaClient} from "@repo/db/client"
import {WebSocketServer} from "ws"

const ws = new WebSocketServer({
    port : 3002
});

ws.on("connection", (socket:WebSocket) => {

    socket.send("client connected!");
})