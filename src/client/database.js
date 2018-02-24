import refreshDom from "./refresh-dom"

const databaseDataById = {}

function databaseRefresh(id, data) {
    databaseDataById[id] = data
    refreshDom()
}

export {
    databaseDataById,
    databaseRefresh
}