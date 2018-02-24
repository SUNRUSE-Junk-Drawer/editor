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

import assetTypes from "./asset-types/index"

import {
    indexGet,
    indexPatch
} from "./index"

function create() {
    const type = Object
        .keys(assetTypes)
        .sort((a, b) => assetTypes[a].label.localeCompare(assetTypes[b].label))[0]

    modalOpen("create", {
        type: type,
        name: `Untitled ${assetTypes[type].label}`
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
        <input type="text" value={databaseDataById[state.id].name} onchange={e => indexPatch(state.id, { name: e.target.value })} />
    </nav>
}

export {
    navRender
}