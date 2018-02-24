import "./nav.css"

import {
    h as picodomH
} from "picodom"

import {
    databaseDataById
} from "./database"

import {
    modalOpen
} from "./modals/index"

import state from "./state"

import refreshDom from "./refresh-dom"

import {
    indexGet
} from "./index"

function create() {
    modalOpen("create", {
        type: "folder",
        name: "Untitled Folder"
    })
    refreshDom()
}

function goUp() {
    indexGet(databaseDataById[state.id].parentFolderId, true)
    state.state = "waitingForData"
    delete state.id
    refreshDom()
}

function navRender() {
    return <nav>
        <button onclick={create}>Create...</button>
        <button onclick={goUp} disabled={!databaseDataById[state.id].parentFolderId}>Go Up</button>
    </nav>
}

export {
    navRender
}