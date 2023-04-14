"use strict"

const MprisInterface = require("./mpris-interface")
const {addDBusTypes, constants} = require("./util")

class PlayerInterface extends MprisInterface {
    constructor(player) {
        super("org.mpris.MediaPlayer2.Player", player)
    }

    _CanControl = true

    _CanPause = true

    _CanPlay = true

    _CanSeek = true

    _CanGoNext = true

    _CanGoPrevious = true

    _Metadata = {}

    _MaximumRate = 1

    _MinimumRate = 1

    _Rate = 1

    _Shuffle = false

    _Volume = 0

    _LoopStatus = constants.LOOP_STATUS_NONE

    _PlaybackStatus = constants.PLAYBACK_STATUS_STOPPED

    get CanControl() {
        return this._CanControl
    }

    get CanPause() {
        return this._CanPause
    }

    get CanPlay() {
        return this._CanPlay
    }

    get CanSeek() {
        return this._CanSeek
    }

    get CanGoNext() {
        return this._CanGoNext
    }

    get CanGoPrevious() {
        return this._CanGoPrevious
    }

    get Metadata() {
        return this._Metadata
    }

    get MaximumRate() {
        return this._MaximumRate
    }

    get MinimumRate() {
        return this._MinimumRate
    }

    get Rate() {
        return this._Rate
    }

    set Rate(value) {
        this._setPropertyInternal("Rate", value)
    }

    get Shuffle() {
        return this._Shuffle
    }

    set Shuffle(value) {
        this._setPropertyInternal("Shuffle", value)
    }

    get Volume() {
        return this._Volume
    }

    set Volume(value) {
        this._setPropertyInternal("Volume", value)
    }

    get Position() {
        const playerPosition = this.player.getPosition()
        const position = Math.floor(playerPosition || 0)
        if (isNaN(position)) {
            const err = "github.mpris_service.InvalidPositionError"
            const message = `The player has set an invalid position: ${
                playerPosition}`
            throw new Error(err, message)
        }
        return position
    }

    get LoopStatus() {
        if (!constants.isLoopStatusValid(this._LoopStatus)) {
            const err = "github.mpris_service.InvalidLoopStatusError"
            const message = `The player has set an invalid loop status: ${
                this._LoopStatus}`
            throw new Error(err, message)
        }
        return this._LoopStatus
    }

    set LoopStatus(value) {
        if (!constants.isLoopStatusValid(value)) {
            const err = "github.mpris_service.InvalidLoopStatusError"
            const message = `Tried to set loop status to an invalid value: ${
                value}`
            throw new Error(err, message)
        }
        this._setPropertyInternal("LoopStatus", value)
    }

    get PlaybackStatus() {
        if (!constants.isPlaybackStatusValid(this._PlaybackStatus)) {
            const err = "github.mpris_service.InvalidPlaybackStatusError"
            const message = `The player has set an invalid playback status: ${
                this._PlaybackStatus}`
            throw new Error(err, message)
        }
        return this._PlaybackStatus
    }

    Next() {
        this.player.emit("next")
    }

    Previous() {
        this.player.emit("previous")
    }

    Pause() {
        this.player.emit("pause")
    }

    PlayPause() {
        this.player.emit("playpause")
    }

    Stop() {
        this.player.emit("stop")
    }

    Play() {
        this.player.emit("play")
    }

    Seek(offset) {
        this.player.emit("seek", parseInt(offset, 10))
    }

    SetPosition(trackId, position) {
        const e = {"position": parseInt(position, 10), trackId}
        this.player.emit("position", e)
    }

    OpenUri(uri) {
        const e = {uri}
        this.player.emit("open", e)
    }

    Seeked(position) {
        return position
    }
}

module.exports = addDBusTypes(PlayerInterface)
