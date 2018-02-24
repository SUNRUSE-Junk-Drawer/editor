import {
    readdir as fsReaddir,
    readFile as fsReadFile
} from "fs"

import {
    join as pathJoin
} from "path"

let initialized

const dataDirectory = pathJoin(__dirname, "../../data")

function databaseInitialize(then) {
    initialized = true
    console.log("Initializing database...")
    console.log("\tListing files...")
    fsReaddir(dataDirectory, (err, files) => {
        if (err) throw new Error(`Failed to list files: "${err}"`)
        console.log("\tReading files...")
        let remaining = files.length
        files.forEach(relativeFilename => {
            const absoluteFilename = pathJoin(dataDirectory, relativeFilename)
            console.log(`\t\tReading "${absoluteFilename}"...`)
            fsReadFile(absoluteFilename, { encoding: "utf8" }, (err, data) => {
                if (err) throw new Error(`Failed to read "${absoluteFilename}": "${err}"`)
                console.log(`\t\tRead "${absoluteFilename}", parsing...`)
                const parsed = JSON.parse(data)
                const id = relativeFilename.split(".")[0]
                console.log(`\t\t\tParsed "${absoluteFilename}" (${parsed.type} ${id} with parent folder ID ${parsed.parentFolderId}), indexing...`)
                indices.forEach(index => index.informOfChange(id, parsed, "\t\t\t\t"))
                console.log(`\t\t\t\tDone.`)
                console.log(`\t\t\tDone.`)
                remaining--
                if (!remaining) {
                    console.log("\tDone.")
                    then()
                }
            })
        })
    })
}

const indices = []

class databaseIndex {
    constructor(name, getter) {
        if (initialized) throw new Error("Cannot create new database indices after the database has ")
        this.name = name
        this.getter = getter
        this.idsByValue = {}
        this.valuesById = {}
        indices.push(this)
    }

    informOfChange(id, patch, logPrefix) {
        let newValue = this.getter(patch)
        if (newValue === null || newValue === undefined) newValue = ""
        const oldValue = this.valuesById[id]

        if (oldValue === undefined) {
            console.log(`${logPrefix}${id} did not previously exist in the "${this.name}" index, added with value "${newValue}".`)
            this.valuesById[id] = newValue
            this.idsByValue[newValue] = this.idsByValue[newValue] || []
            this.idsByValue[newValue].push(id)
        } else {
            if (oldValue == newValue) {
                console.log(`${logPrefix}${id} already exists in the "${this.name}" index with value "${newValue}".`)
            } else {
                console.log(`${logPrefix}${id} already exists in the "${this.name}" index, but with value "${oldValue}"; updated to value "${newValue}".`)
                this.valuesById[id] = newValue
                this.idsByValue[oldValue].splice(this.idsByValue[oldValue].indexOf(id), 1)
                this.idsByValue[newValue] = this.idsByValue[newValue] || []
                this.idsByValue[newValue].push(id)
            }
        }
    }
}

const databaseTypeIndex = new databaseIndex("type", patch => patch.type)
const databaseParentFolderIdIndex = new databaseIndex("parentFolderId", patch => patch.parentFolderId)

export {
    databaseInitialize,
    databaseIndex,
    databaseTypeIndex,
    databaseParentFolderIdIndex
}