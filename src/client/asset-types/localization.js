import "./localization.css"

import {
    h as picodomH
} from "picodom"

export default {
    label: "Localization",
    thumbnailView(id) {
        return <div class="localization-thumbnail">A/あ</div>
    },
    editorView(id, data) {
        return <div>Localization!</div>
    }
}