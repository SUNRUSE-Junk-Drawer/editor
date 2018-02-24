import "./reset.css"
import refreshDom from "./refresh-dom.js"
import state from "./state"
import {
    databaseRefresh,
    databaseDataById
} from "./database";

addEventListener("load", () => {
    state.state = "connecting"
    refreshDom()
    const socket = new WebSocket(`ws://${location.host}`)

    socket.addEventListener("open", () => {
        state.state = "waitingForData"
        refreshDom()
    })

    socket.addEventListener("message", event => {
        const message = JSON.parse(event.data)
        if (state.state == "waitingForData") {
            state.state = "ready"
            state.id = message.id
        }
        switch (message.type) {
            case "refresh": {
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