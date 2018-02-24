import "./reset.css"
import refreshDom from "./refresh-dom.js"
import state from "./state"
import {
    databaseRefresh
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
            refreshDom()
        }
        switch (message.type) {
            case "refresh": databaseRefresh(message.id, message.data)
        }
    })

    socket.addEventListener("error", event => console.log(`A socket error occurred: ${event}`))
})