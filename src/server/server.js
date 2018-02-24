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

import {
    databaseParentFolderIdIndex,
    databaseGet
} from "./database";

function serverInitialize(then) {
    console.log("Initializing server...")

    const app = express()
    app.use(express.static(pathJoin(__dirname, "../../dist")))

    const server = httpCreateServer(app)
    const socketServer = new wsServer({ server })

    socketServer.on("connection", (socket, request) => {
        console.log("New connection.")
        socket.on("error", event => console.log(`Socket error: ${event}`))
        socket.on("message", event => {
            const message = JSON.parse(event)
            console.log(`Received: ${message}`)
            switch (message.type) {
                case "get": {
                    console.log(`\tHandling get...`)
                    sendRefresh(message.id, "\t")
                    console.log(`\tDone.`)
                } break
                default: {
                    console.log(`\tUnexpected message type "${message.type}"`)
                } break
            }
        })
        sendRefresh(databaseParentFolderIdIndex.idsByValue[""][0], "\t")

        function sendRefresh(id, logPrefix) {
            console.log(`${logPrefix}Sending refresh of ${id}...`)
            databaseGet(id, `${logPrefix}\t`, data => {
                console.log(`${logPrefix}\tSending...`)
                socket.send(JSON.stringify({
                    type: "refresh",
                    id: id,
                    data: data,
                    children: databaseParentFolderIdIndex.idsByValue[id]
                }))
                console.log(`${logPrefix}\tDone.`)
            })
        }
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