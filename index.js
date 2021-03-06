const express = require("express");
const expressWs = require("express-ws");
const {nanoid} = require("nanoid");
const app = express();
expressWs(app);

const activeConnections = {};
let pixels = [];

app.ws("/", (ws, req) => {
    const id = nanoid();
    console.log("Client connected! id = " + id);
    activeConnections[id] = ws;

    ws.on("message", msg => {
        const decodedMessage = JSON.parse(msg);
        switch (decodedMessage.type) {
            case "GET_ALL_PIXELS":
                ws.send(JSON.stringify({type: "ALL_PIXELS", pixels}));
                break;
            case "CREATE_PIXELS":
                Object.keys(activeConnections).forEach(connId => {
                    const conn = activeConnections[connId];
                    pixels = pixels.concat(decodedMessage.newPixels)
                    conn.send(JSON.stringify({
                        type: "NEW_PIXEL",
                        newPixels: decodedMessage.newPixels
                    }));
                });
                break;
            default:
                console.log("Unknown message type:", decodedMessage.type);
        }
    });

    ws.on("close", msg => {
        console.log("Client disconnected! id =", id);
        delete activeConnections[id];
    });
});

app.listen(8000, () => {
    console.log("Server started at http://localhost:8000");
});