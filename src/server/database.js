import {
    readdir as fsReaddir,
    readFile as fsReadFile,
    writeFile as fsWriteFile
} from "fs"

import {
    join as pathJoin
} from "path"

import {
    v4 as uuidV4
} from "uuid"

import jsonStableStringify from "json-stable-stringify"

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
                    console.log("\t\tDone.")
                    if (databaseParentFolderIdIndex.idsByValue[""]) {
                        console.log(`\tThe root folder already exists with ID ${databaseParentFolderIdIndex.idsByValue[""][0]}.`)
                        afterCheckingRootFolder()
                    } else {
                        console.log("\tThe root folder does not exist.")
                        databaseCreate("folder", null, "\t", id => {
                            rootFolderId = id
                            afterCheckingRootFolder()
                        })
                    }

                    function afterCheckingRootFolder() {
                        console.log("\tDone.")
                        then()
                    }
                }
            })
        })
    })
}

function databaseCreate(type, parentFolderId, logPrefix, then) {
    const id = uuidV4()
    console.log(`${logPrefix}Creating ${type} ${id} with parent folder ID ${parentFolderId}...`)

    const data = {
        type: type,
        parentFolderId: parentFolderId,
        data: {}
    }

    fsWriteFile(pathJoin(dataDirectory, `${id}.json`), jsonStableStringify(data), err => {
        if (err) throw new Error(`Failed to create a file to represent ${type} ${id}: "${err}"`)
        console.log(`${logPrefix}\tFile written for ${type} ${id}, indexing...`)
        indices.forEach(index => index.informOfChange(id, data, `${logPrefix}\t\t`))
        console.log(`${logPrefix}\tDone.`)
        then(id)
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