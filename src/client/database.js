import refreshDom from "./refresh-dom"

const databaseDataById = {}
const databaseChildrenById = {}

function databaseRefresh(id, data, children) {
    databaseDataById[id] = data
    databaseChildrenById[id] = children
    if (data.parentFolderId) {
        for (const parentId in databaseChildrenById) {
            if (parentId == data.parentFolderId) continue
            const index = databaseChildrenById[parentId].indexOf(id)
            if (index != -1) databaseChildrenById[parentId].splice(index, 1)
        }
        if (databaseChildrenById[data.parentFolderId] && databaseChildrenById[data.parentFolderId].indexOf(id) == -1) {
            databaseChildrenById[data.parentFolderId].push(id)
        }
    }
    refreshDom()
}

export {
    databaseDataById,
    databaseChildrenById,
    databaseRefresh
}