import "./folder.css"

import {
    h as picodomH
} from "picodom"

import {
    databaseDataById,
    databaseChildrenById
} from "./../database"

import {
    indexGet
} from "./../index"

import state from "./../state"

import refreshDom from "./../refresh-dom"

import assetTypes from "./index"

function itemClicked(id) {
    indexGet(id, true)
    state.state = "waitingForData"
    delete state.id
    state.modals.pop()
    refreshDom()
}

export default {
    label: "Folder",
    thumbnailView(id) {
        return <div class="folder-thumbnail">📁&#xFE0E;</div>
    },
    editorView(id) {
        return <div class="folder">{databaseChildrenById[id].map(childId => {
            const data = databaseDataById[childId]
            if (!data) return <button class="folder-item" disabled>
                <div class="folder-item-thumbnail"></div>
                <div class="folder-item-name">Loading...</div>
            </button>
            return <button class="folder-item" onclick={() => itemClicked(childId)}>
                <div class="folder-item-thumbnail">{assetTypes[data.type].thumbnailView(childId)}</div>
                <div class="folder-item-name">{data.name}</div>
            </button>
        })}</div>
    }
}