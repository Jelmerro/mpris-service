"use strict"

const MprisInterface = require("./mpris-interface")
const {addDBusTypes} = require("./util")

class RootInterface extends MprisInterface {
    constructor(player, opts = {}) {
        super("org.mpris.MediaPlayer2", player)
        if (opts.identity) {
            this._Identity = opts.identity
        }
        if (opts.supportedUriSchemes) {
            this._SupportedUriSchemes = opts.supportedUriSchemes
        }
        if (opts.supportedMimeTypes) {
            this._SupportedMimeTypes = opts.supportedMimeTypes
        }
        if (opts.desktopEntry) {
            this._DesktopEntry = opts.desktopEntry
        }
    }

    _CanQuit = true

    _Fullscreen = false

    _CanSetFullscreen = false

    _CanRaise = true

    _HasTrackList = false

    _Identity = ""

    _DesktopEntry = ""

    _SupportedUriSchemes = []

    _SupportedMimeTypes = []

    get CanQuit() {
        return this._CanQuit
    }

    get Fullscreen() {
        return this._Fullscreen
    }

    set Fullscreen(value) {
        this._setPropertyInternal("Fullscreen", value)
    }

    get CanSetFullscreen() {
        return this._CanSetFullscreen
    }

    get CanRaise() {
        return this._CanRaise
    }

    get HasTrackList() {
        return this._HasTrackList
    }

    get Identity() {
        return this._Identity
    }

    get DesktopEntry() {
        return this._DesktopEntry
    }

    get SupportedUriSchemes() {
        return this._SupportedUriSchemes
    }

    get SupportedMimeTypes() {
        return this._SupportedMimeTypes
    }

    Raise() {
        this.player.emit("raise")
    }

    Quit() {
        this.player.emit("quit")
    }
}

module.exports = addDBusTypes(RootInterface)
