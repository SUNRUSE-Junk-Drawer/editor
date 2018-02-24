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

import refreshDom from "./refresh-dom"

function create() {
    modalOpen("create", {
        type: "folder",
        name: "Untitled Folder"
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