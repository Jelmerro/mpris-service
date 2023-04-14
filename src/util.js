"use strict"

const {Variant} = require("dbus-final")

const guessMetadataSignature = (key, value) => {
    if (key === "mpris:trackid") {
        return "o"
    }
    if (key === "mpris:length") {
        return "x"
    }
    if (typeof value === "string") {
        return "s"
    }
    if (typeof value === "boolean") {
        return "b"
    }
    if (typeof value === "number") {
        return "d"
    }
    if (Array.isArray(value) && value.every(v => typeof v === "string")) {
        return "as"
    }
    return null
}

const metadataToPlain = metadataVariant => {
    const metadataPlain = {}
    for (const k of Object.keys(metadataVariant)) {
        const value = metadataVariant[k]
        if (value === undefined || value === null) {
            continue
        }
        if (value.constructor === Variant) {
            metadataPlain[k] = value.value
        } else {
            metadataPlain[k] = value
        }
    }
    return metadataPlain
}

const metadataToDbus = metadataPlain => {
    const metadataVariant = {}
    for (const k of Object.keys(metadataPlain)) {
        const value = metadataPlain[k]
        const signature = guessMetadataSignature(k, value)
        if (signature) {
            metadataVariant[k] = new Variant(signature, value)
        }
    }
    return metadataVariant
}

const emptyPlaylist = ["/", "", ""]
const playlistToDbus = playlist => {
    if (!playlist) {
        return emptyPlaylist
    }

    const {Id, Name, Icon} = playlist
    return [Id, Name, Icon]
}

const playlistToPlain = wire => {
    const [Id, Name, Icon] = wire
    return {Icon, Id, Name}
}

const lcfirst = str => str[0].toLowerCase() + str.substr(1)

module.exports = {
    emptyPlaylist,
    lcfirst,
    metadataToDbus,
    metadataToPlain,
    playlistToDbus,
    playlistToPlain
}
