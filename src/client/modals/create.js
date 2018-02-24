import {
    h as picodomH
} from "picodom"

import state from "./../state"
import refreshDom from "./../refresh-dom"

import {
    databaseDataById
} from "./../database"

import {
    indexCreate
} from "./../index"

import assetTypes from "./../asset-types/index"

function changeType(modalState, to) {
    modalState.type = to
    refreshDom()
}

function changeName(modalState, to) {
    modalState.name = to
    refreshDom()
}

export default {
    title: "Create Asset",
    view(modalState) {
        return <div>
            <div class="field">
                <label for={`modal-create-${modalState.id}-type`}>Type: </label>
                <select id={`modal-create-${modalState.id}-type`} value={modalState.type} onchange={e => changeType(modalState, e.target.value)}>{Object
                    .keys(assetTypes)
                    .sort((a, b) => assetTypes[a].label.localeCompare(assetTypes[b].label))
                    .map(type => <option value={type}>{assetTypes[type].label}</option>)
                }</select>
            </div>
            <div class="field">
                <label for={`modal-create-${modalState.id}-name`}>Name: </label>
                <input id={`modal-create-${modalState.id}-name`} value={modalState.name} onchange={e => changeName(modalState, e.target.value)} />
            </div>
        </div>
    },
    buttons: [{
        label: "Create",
        onclick(modalState) {
            indexCreate(
                modalState.type,
                modalState.name,
                state.id,
                databaseDataById[state.id].type == "folder"
                    ? state.id
                    : databaseDataById[state.id].parentFolderId
            )
            state.state = "waitingForData"
            delete state.id
            state.modals.pop()
            refreshDom()
        }
    }, {
        label: "Cancel",
        onclick(modalState) {
            state.modals.pop()
            refreshDom()
        }
    }]
}