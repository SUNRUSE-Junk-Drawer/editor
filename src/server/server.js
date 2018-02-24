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
    databaseTypeIndex,
    databaseCreate,
    databaseGet,
    databasePatch
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
                    sendRefresh(socket, message.id, message.show, false, "\t")
                    console.log(`\tDone.`)
                } break
                case "create": {
                    console.log(`\tHandling create...`)
                    databaseCreate(message.assetType, message.name, message.parentFolderId, "\t", id => {
                        socketServer.clients.forEach(client => sendRefresh(client, id, client == socket, false, "\t"))
                        console.log("\tDone.")
                    })
                } break
                case "patch": {
                    console.log(`\tHandling patch...`)
                    databasePatch(message.id, message.patch, "\t", () => {
                        socketServer.clients.forEach(client => sendPatch(client, message.id, message.patch, "\t"))
                        console.log("\tDone.")
                    })
                }
                default: {
                    console.log(`\tUnexpected message type "${message.type}"`)
                } break
            }
        })
        sendRefresh(socket, databaseParentFolderIdIndex.idsByValue[""][0], true, true, "\t")
    })

    socketServer.on("error", event => console.log(`Socket server error: ${event}`))

    socketServer.on("listening", () => console.log("\tThe socket server is now listening."))

    function sendRefresh(socket, id, show, includeIndices, logPrefix) {
        console.log(`${logPrefix}Sending refresh of ${id} (${show ? "this is to be shown" : "this is not to be shown"})...`)
        databaseGet(id, `${logPrefix}\t`, data => {
            console.log(`${logPrefix}\tSending...`)
            socket.send(JSON.stringify({
                type: "refresh",
                id: id,
                show: show,
                data: data,
                indices: includeIndices ? {
                    type: databaseTypeIndex.idsByValue,
                    parentFolderId: databaseParentFolderIdIndex.idsByValue
                } : null,
                children: databaseParentFolderIdIndex.idsByValue[id] || []
            }))
            console.log(`${logPrefix}\tDone.`)
        })
    }

    function sendPatch(socket, id, patch, logPrefix) {
        console.log(`${logPrefix}Sending patch of ${id}...`)
        socket.send(JSON.stringify({
            type: "patch",
            id: id,
            patch: patch
        }))
        console.log(`${logPrefix}\tDone.`)
    }

    server.listen(3333, () => {
        console.log("\tDone.")
        then()
    })
}

export {
    serverInitialize
}