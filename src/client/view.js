import "./editor.css"

import { h as picodomH } from "picodom"
import state from "./state"
import {
    navRender
} from "./nav"

import {
    databaseDataById
} from "./database"

import assetTypes from "./asset-types/index"

export default () => {
    switch (state.state) {
        case "loading": return <div>Loading...</div>
        case "connecting": return <div>Connecting...</div>
        case "waitingForData": return <div>Waiting for data...</div>
        case "ready": return <div>
            {navRender()}
            <div class="editor">{assetTypes[databaseDataById[state.id].type].editorView(state.id)}</div>
        </div>
    }
}