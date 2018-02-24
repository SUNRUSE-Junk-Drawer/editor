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

function changeType(modal, to) {
    modal.state.type = to
    refreshDom()
}

function changeName(modal, to) {
    modal.state.name = to
    refreshDom()
}

export default {
    title: "Create Asset",
    view(modal) {
        return <div>
            <div class="field">
                <label for={`modal-create-${modal.id}-type`}>Type: </label>
                <select id={`modal-create-${modal.id}-type`} value={modal.state.type} onchange={e => changeType(modal, e.target.value)}>{Object
                    .keys(assetTypes)
                    .sort((a, b) => assetTypes[a].label.localeCompare(assetTypes[b].label))
                    .map(type => <option value={type}>{assetTypes[type].label}</option>)
                }</select>
            </div>
            <div class="field">
                <label for={`modal-create-${modal.id}-name`}>Name: </label>
                <input id={`modal-create-${modal.id}-name`} value={modal.state.name} onchange={e => changeName(modal, e.target.value)} />
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