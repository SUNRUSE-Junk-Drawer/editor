import express from "express"

import {
    createServer as httpCreateServer
} from "http"

import {
    join as pathJoin
} from "path"

const app = express()
app.use(express.static(pathJoin(__dirname, "../../dist")))

const server = httpCreateServer(app)


server.listen(3333, () => console.log("Server now running."))