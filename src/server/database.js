import {
    exists as fsExists,
    mkdir as fsMkdir,
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

import {
    patchApply
} from "./../patch"

import jsonStableStringify from "json-stable-stringify"

let initialized

const dataDirectory = pathJoin(__dirname, "../../data")

function databaseInitialize(then) {
    initialized = true
    console.log("Initializing database...")
    console.log("\tChecking whether data directory exists...")
    fsExists(dataDirectory, exists => {
        if (exists) {
            console.log("\tThe data directory already exists.")
            afterEnsuringDataDirectoryExists()
        } else {
            console.log("\tThe data directory does not exist, creating...")
            fsMkdir(dataDirectory, err => {
                if (err) throw new Error(`Failed to create the data directory: "${err}"`)
                console.log("\t\tDone.")
                afterEnsuringDataDirectoryExists()
            })
        }

        function afterEnsuringDataDirectoryExists() {
            console.log("\tListing files...")
            fsReaddir(dataDirectory, (err, files) => {
                if (err) throw new Error(`Failed to list files: "${err}"`)
                if (files.length) {
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
                            console.log(`\t\t\tParsed "${absoluteFilename}" (${parsed.type} ${id} "${parsed.name}" with parent folder ID ${parsed.parentFolderId}), indexing...`)
                            indices.forEach(index => index.informOfChange(id, parsed, "\t\t\t\t"))
                            console.log(`\t\t\t\tDone.`)
                            console.log(`\t\t\tDone.`)
                            remaining--
                            if (!remaining) afterReadingFiles()
                        })
                    })
                } else {
                    console.log("\tThere are no files to read.")
                    afterReadingFiles()
                }

                function afterReadingFiles() {
                    console.log("\t\tDone.")
                    if (databaseParentFolderIdIndex.idsByValue["null"]) {
                        console.log(`\tThe root folder already exists with ID ${databaseParentFolderIdIndex.idsByValue["null"][0]}.`)
                        afterCheckingRootFolder()
                    } else {
                        console.log("\tThe root folder does not exist.")
                        databaseCreate("folder", "Root", null, "\t", afterCheckingRootFolder)
                    }

                    function afterCheckingRootFolder() {
                        console.log("\tDone.")
                        then()
                    }
                }
            })
        }
    })
}

function databaseCreate(type, name, parentFolderId, logPrefix, then) {
    const id = uuidV4()
    console.log(`${logPrefix}Creating ${type} ${id} "${name}" with parent folder ID ${parentFolderId}...`)

    const data = {
        type: type,
        name: name,
        parentFolderId: parentFolderId,
        data: {}
    }

    fsWriteFile(pathJoin(dataDirectory, `${id}.json`), jsonStableStringify(data), err => {
        if (err) throw new Error(`Failed to create a file to represent ${type} ${id} "${name}": "${err}"`)
        console.log(`${logPrefix}\tFile written for ${type} ${id} "${name}", indexing...`)
        indices.forEach(index => index.informOfChange(id, data, `${logPrefix}\t\t`))
        console.log(`${logPrefix}\t\tDone.`)
        console.log(`${logPrefix}\tDone.`)
        then(id)
    })
}

function databaseGet(id, logPrefix, then) {
    console.log(`${logPrefix}Getting ${id}...`)
    const absoluteFilename = pathJoin(dataDirectory, `${id}.json`)
    console.log(`${logPrefix}\tReading "${absoluteFilename}"...`)
    fsReadFile(absoluteFilename, { encoding: "utf8" }, (err, data) => {
        if (err) throw new Error(`Failed to read "${absoluteFilename}": "${err}"`)
        console.log(`${logPrefix}\tRead "${absoluteFilename}", parsing...`)
        const parsed = JSON.parse(data)
        console.log(`${logPrefix}\tDone.`)
        then(parsed)
    })
}

let idsBeingPatched = []

function databasePatch(id, patch, logPrefix, then) {
    console.log(`${logPrefix}Patching ${id}...`)
    if (idsBeingPatched.indexOf(id) != -1) {
        console.log(`${logPrefix}\tThis is currently being patched by another thread; cancelled.`)
    } else {
        console.log(`${logPrefix}\tThis is not currently being patched by another thread.`)
        idsBeingPatched.push(id)
        const absoluteFilename = pathJoin(dataDirectory, `${id}.json`)
        console.log(`${logPrefix}\tReading "${absoluteFilename}"...`)
        fsReadFile(absoluteFilename, { encoding: "utf8" }, (err, data) => {
            if (err) throw new Error(`Failed to read "${absoluteFilename}": "${err}"`)
            console.log(`${logPrefix}\tRead "${absoluteFilename}", parsing...`)
            let parsed = JSON.parse(data)
            console.log(`\t\t\tParsed "${absoluteFilename}" (${parsed.type} ${id} "${parsed.name}" with parent folder ID ${parsed.parentFolderId}), applying patch...`)
            parsed = patchApply(patch, parsed)
            console.log(`${logPrefix}\tApplied patch, overwriting...`)
            fsWriteFile(absoluteFilename, jsonStableStringify(parsed), err => {
                if (err) throw new Error(`Failed to create a file to represent ${parsed.type} ${id} "${parsed.name}": "${err}"`)
                console.log(`${logPrefix}\tFile overwritten for ${parsed.type} ${id} "${parsed.name}", re-indexing...`)
                indices.forEach(index => index.informOfChange(id, parsed, `${logPrefix}\t\t`))
                console.log(`${logPrefix}\t\tDone.`)
                console.log(`${logPrefix}\tDone.`)
                idsBeingPatched.splice(idsBeingPatched.indexOf(id), 1)
            })
            then(parsed)
        })
    }
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
        if (newValue === undefined) return
        newValue = `${newValue}`
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
    databaseParentFolderIdIndex,
    databaseCreate,
    databaseGet,
    databasePatch
}