import "./localization.css"

import {
    h as picodomH
} from "picodom"

import {
    indexPatch
} from "./../index"

import {
    databaseDataById
} from "./../database"

export default {
    label: "Localization",
    thumbnailView(id) {
        return <div class="localization-thumbnail">A/あ</div>
    },
    editorView(id, data) {
        return <div>
            <div class="field">
                <label for={`editor-${id}-name`}>Name: </label>
                <input id={`editor-${id}-name`} type="text" value={data.data.name || ""} onchange={e => indexPatch(id, { data: { name: e.target.value } })} />
            </div>
        </div>
    }
}