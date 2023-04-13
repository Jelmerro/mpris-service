"use strict"

const {Interface} = require("dbus-next").interface
const {
    addDBusTypes, metadataToDbus, playlistToDbus, emptyPlaylist
} = require("./util")

class MprisInterface extends Interface {
    constructor(name, player) {
        super(name)
        this.player = player
    }

    // Nothing is currently settable internally that needs conversion to plain
    _setPropertyInternal(prop, valueDbus) {
        this.player.emit(prop[0].toLowerCase() + prop.substr(1), valueDbus)
    }

    // Convert the plain value to a dbus value (default to the plain value)
    setProperty(property, valuePlain) {
        let valueDbus = valuePlain
        if (property === "Metadata") {
            valueDbus = metadataToDbus(valuePlain)
        } else if (property === "ActivePlaylist") {
            if (valuePlain) {
                valueDbus = [true, playlistToDbus(valuePlain)]
            } else {
                valueDbus = [false, emptyPlaylist]
            }
        } else if (property === "Tracks") {
            valueDbus = valuePlain.filter(
                t => t["mpris:trackid"]).map(t => t["mpris:trackid"])
        }
        this[`_${property}`] = valueDbus
        try {
            const changedProperties = {}
            changedProperties[property] = valueDbus
            Interface.emitPropertiesChanged(this, changedProperties)
        } catch (e) {
            console.warn(e, property, valueDbus)
        }
    }
}

module.exports = addDBusTypes(MprisInterface)
