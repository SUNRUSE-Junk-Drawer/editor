import {
    existsSync as fsExistsSync,
    readdirSync as fsReaddirSync,
    mkdirSync as fsMkdirSync,
    writeFileSync as fsWriteFileSync,
    readFileSync as fsReadFileSync
} from "fs"

import {
    join as pathJoin
} from "path"

import {
    v4 as uuidV4
} from "uuid"

import jsonStableStringify from "json-stable-stringify"

console.log("Initializing database...")

const dataDirectory = pathJoin(__dirname, "../../data")

console.log("\tChecking whether the data directory exists...")
if (fsExistsSync(dataDirectory)) {
    console.log("\t\tThe data directory exists.")
} else {
    console.log("\t\tThe data directory does not exist, creating...")
    fsMkdirSync(dataDirectory)
    console.log("\t\tThe data directory has been created.")
}

let databaseRootFolderId
const dataById = {}
console.log("\tReading all existing content...")
fsReaddirSync(dataDirectory).forEach(filename => {
    console.log(`\t\tFile "${filename}..."`)
    console.log("\t\t\tReading...")
    const dataText = fsReadFileSync(pathJoin(dataDirectory, filename), { encoding: "utf8" })
    console.log("\t\t\tParsing...")
    const data = JSON.parse(dataText)
    const id = filename.split(".")[0]
    dataById[id] = data
    console.log(`\t\t\t${data.type} ${id}, parent folder ID ${data.parentFolderId}.`)
    if (!data.parentFolderId) {
        console.log("\t\t\tThis is the root folder.")
        databaseRootFolderId = id
    }
})
console.log("\t\tDone.")

if (!databaseRootFolderId) {
    console.log("\tThere is no root folder, creating...")
    databaseRootFolderId = databaseCreate("folder", null, "\t\t")
    console.log("\t\tDone.")
}

function databaseCreate(type, parentFolderId, logPrefix) {
    const id = uuidV4()
    console.log(`${logPrefix}Creating ${type} ${id} with parent folder ID ${parentFolderId}`)
    const data = {
        type: type,
        parentFolderId: parentFolderId
    }
    const stringified = jsonStableStringify(data, { space: 4 })
    fsWriteFileSync(pathJoin(dataDirectory, `${id}.json`), stringified)
    dataById[id] = data
    console.log(`${logPrefix}\tDone.`)
    return id
}

export {
    databaseRootFolderId
}