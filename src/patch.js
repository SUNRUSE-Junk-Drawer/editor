function patchApply(patch, to) {
    if (to === undefined) return patch
    if (isNonObject(patch)) return patch
    if (isNonObject(to)) return patch
    for (const key in patch) to[key] = patchApply(patch[key], to[key])
    return to
}

function isNonObject(value) {
    return value == null
        || (typeof value == "boolean")
        || (typeof value == "string")
        || (typeof value == "number")
        || Array.isArray(value)
}

export {
    patchApply
}