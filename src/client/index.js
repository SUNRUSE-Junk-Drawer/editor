import "./reset.css"
import refreshDom from "./refresh-dom.js"
import state from "./state"
import {
    databaseRefresh,
    databaseDataById
} from "./database";

let socket

addEventListener("load", () => {
    state.state = "connecting"
    refreshDom()
    socket = new WebSocket(`ws://${location.host}`)

    socket.addEventListener("open", () => {
        state.state = "waitingForData"
        refreshDom()
    })

    socket.addEventListener("message", event => {
        const message = JSON.parse(event.data)
        switch (message.type) {
            case "refresh": {
                if (message.show) {
                    state.state = "ready"
                    state.id = message.id
                }
                databaseRefresh(message.id, message.data, message.children)
                if (message.id == state.id) {
                    message.children.forEach(childId => {
                        if (!databaseDataById[childId]) {
                            socket.send(JSON.stringify({
                                type: "get",
                                id: childId
                            }))
                        }
                    })
                }
            }
        }
    })

    socket.addEventListener("error", event => console.log(`A socket error occurred: ${event}`))
})

function indexCreate(type, name, parentFolderId) {
    socket.send(JSON.stringify({
        type: "create",
        assetType: type,
        name: name,
        parentFolderId: parentFolderId
    }))
}

export {
    indexCreate
}