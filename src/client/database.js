import {
    patchApply
} from "./../patch"

const databaseDataById = {}

function databaseRefresh(id, data, children) {
    indices.forEach(index => index.informOfChange(id, data))
    databaseDataById[id] = data
}

function databasePatch(id, patch) {
    indices.forEach(index => index.informOfChange(id, patch))
    const data = databaseDataById[id]
    if (!data) return
    databaseDataById[id] = patchApply(patch, data)
}

const indices = []

class databaseIndex {
    constructor(getter) {
        this.getter = getter
        this.idsByValue = {}
        this.valuesById = {}
        indices.push(this)
    }

    initialize(idsByValue) {
        this.idsByValue = idsByValue
        for (const value in idsByValue) {
            idsByValue[value].forEach(id => this.valuesById[id] = value)
        }
    }

    informOfChange(id, patch) {
        let newValue = this.getter(patch)
        if (newValue === null || newValue === undefined) newValue = ""
        const oldValue = this.valuesById[id]

        if (oldValue === undefined) {
            this.valuesById[id] = newValue
            this.idsByValue[newValue] = this.idsByValue[newValue] || []
            this.idsByValue[newValue].push(id)
        } else {
            if (oldValue != newValue) {
                this.valuesById[id] = newValue
                this.idsByValue[oldValue].splice(this.idsByValue[oldValue].indexOf(id), 1)
                this.idsByValue[newValue] = this.idsByValue[newValue] || []
                this.idsByValue[newValue].push(id)
            }
        }
    }
}

const databaseTypeIndex = new databaseIndex(patch => patch.type)
const databaseParentFolderIdIndex = new databaseIndex(patch => patch.parentFolderId)

export {
    databaseDataById,
    databaseRefresh,
    databasePatch,
    databaseIndex,
    databaseTypeIndex,
    databaseParentFolderIdIndex
}