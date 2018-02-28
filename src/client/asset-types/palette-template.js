import "./palette-template.css"

import {
    v4 as uuidV4
} from "uuid"

import {
    h as picodomH
} from "picodom"

import {
    indexPatch
} from "./../index"

import {
    patchOneKey
} from "./../../patch"

import refreshDom from "./../refresh-dom"

export default {
    label: "Palette Template",
    thumbnailView(id) {
        return <div class="palette-template-thumbnail">🎨&#xFE0E;</div>
    },
    editorView(id, data) {
        return <div class="palette-template">
            <div>{(data.data.colorsOrder || []).map((colorId, colorIndex) => <div class="field">
                <button onclick={() => indexPatch(id, {
                    data: {
                        colorsOrder: data.data.colorsOrder.slice(0, colorIndex)
                            .concat(data.data.colorsOrder.slice(colorIndex + 1))
                    }
                })}>✕&#xFE0E;</button>
                <button onclick={() => indexPatch(id, {
                    data: {
                        colorsOrder: data.data.colorsOrder.slice(0, colorIndex - 1)
                            .concat(data.data.colorsOrder[colorIndex])
                            .concat(data.data.colorsOrder[colorIndex - 1])
                            .concat(data.data.colorsOrder.slice(colorIndex + 1))
                    }
                })} disabled={colorIndex == 0}>↑&#xFE0E;</button>
                <button onclick={() => indexPatch(id, {
                    data: {
                        colorsOrder: data.data.colorsOrder.slice(0, colorIndex)
                            .concat(data.data.colorsOrder[colorIndex + 1])
                            .concat(data.data.colorsOrder[colorIndex])
                            .concat(data.data.colorsOrder.slice(colorIndex + 2))
                    }
                })} disabled={colorIndex == data.data.colorsOrder.length - 1}>↓&#xFE0E;</button>
                <label for={`editor-${id}-color-${colorId}-name`}>Name: </label>
                <input id={`editor-${id}-color-${colorId}-name`} type="text" value={data.data.colors[colorId].name || ""} onchange={e => indexPatch(id, { data: { colors: patchOneKey(colorId, { name: e.target.value }) } })} />
            </div>)}</div>
            <button onclick={e => {
                const newColorId = uuidV4()

                const colorsPatch = {}
                colorsPatch[newColorId] = {}

                indexPatch(id, {
                    data: {
                        colors: colorsPatch,
                        colorsOrder: (data.data.colorsOrder || []).concat([newColorId])
                    }
                })
            }}>Add Color</button>
        </div>
    }
}