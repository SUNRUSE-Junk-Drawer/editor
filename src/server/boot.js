import {
    databaseInitialize
} from "./database"

import {
    serverInitialize
} from "./server"

console.log("Initializing...")

databaseInitialize(() => {
    serverInitialize(() => {
        console.log("Initialized.")
    })
})