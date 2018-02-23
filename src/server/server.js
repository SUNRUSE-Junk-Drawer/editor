import express from "express"

import {
    createServer as httpCreateServer
} from "http"

import {
    join as pathJoin
} from "path"

import {
    Server as wsServer
} from "ws"

import "./database"

const app = express()
app.use(express.static(pathJoin(__dirname, "../../dist")))

const server = httpCreateServer(app)
const socketServer = new wsServer({ server })

socketServer.on("connection", (socket, request) => {
    socket.on("error", event => console.log(`Socket error: ${event}`))
    socket.on("message", event => {
        const message = JSON.parse(event)
        console.log(`Received: ${message}`)
    })
    socket.send(JSON.stringify({

    }))
})

socketServer.on("error", event => console.log(`Socket server error: ${event}`))

server.listen(3333, () => console.log("Server now running."))