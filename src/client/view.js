import "./editor.css"

import { h as picodomH } from "picodom"
import state from "./state"

export default () => {
    switch (state.state) {
        case "loading": return <div>Loading...</div>
        case "connecting": return <div>Connecting...</div>
        case "waitingForData": return <div>Waiting for data...</div>
        case "ready": return <div>Ready.</div>
    }
}