import { patch as picodomPatch } from "picodom"
import view from "./view"

let loaded = false
let oldNode

function refresh() {
    const newNode = view()
    picodomPatch(oldNode, newNode, document.body)
    oldNode = newNode
}

addEventListener("load", () => {
    loaded = true
    refresh()
})

export default () => {
    if (loaded) refresh()
}