import "./nav.css"

import {
    h as picodomH
} from "picodom"

import {
    databaseDataById
} from "./database"

import state from "./state"
import refreshDom from "./refresh-dom"

function create() {
    state.modals.push({
        type: "create",
        state: {
            type: "folder",
            name: "Untitled Folder"
        }
    })
    refreshDom()
}

function navRender() {
    return <nav>
        <button onclick={create}>Create...</button>
        <button>Go Up</button>
    </nav>
}

export {
    navRender
}