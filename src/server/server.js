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

function serverInitialize(then) {
    console.log("Initializing server...")

    const app = express()
    app.use(express.static(pathJoin(__dirname, "../../dist")))

    const server = httpCreateServer(app)
    const socketServer = new wsServer({ server })

    socketServer.on("connection", (socket, request) => {
        socket.on("error", event => console.log(`Socket error: ${event}`))
        socket.on("message", event => {
            const message = JSON.parse(event)
            console.log(`Received: ${message}`)
            switch (message.type) {
                case "get": {
                    console.log(`\tHandling get...`)
                    socket.send(JSON.stringify({
                        type: "refresh",
                        id: message.id,
                        data: databaseDataById[message.id],
                        children: databaseGetChildren(message.id, "\t")
                    }))
                    console.log(`\tDone.`)
                } break
                default: {
                    console.log(`\tUnexpected message type "${message.type}"`)
                } break
            }
        })
        socket.send(JSON.stringify({
            type: "refresh",
            id: databaseRootFolderId,
            data: databaseDataById[databaseRootFolderId],
            children: databaseGetChildren(databaseRootFolderId, "")
        }))
    })

    socketServer.on("error", event => console.log(`Socket server error: ${event}`))

    socketServer.on("listening", () => console.log("\tThe socket server is now listening."))

    server.listen(3333, () => {
        console.log("\tDone.")
        then()
    })
}

export {
    serverInitialize
}