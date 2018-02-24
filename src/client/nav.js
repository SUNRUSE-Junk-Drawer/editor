import "./nav.css"

import {
    h as picodomH
} from "picodom"

import {
    databaseDataById
} from "./database"

import state from "./state"
import refreshDom from "./refresh-dom"

function navRender() {
    return <nav>
        <button>New...</button>
        <button>Go Up</button>
    </nav>
}

export {
    navRender
}