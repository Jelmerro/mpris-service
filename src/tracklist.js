"use strict"

const MprisInterface = require("./mpris-interface")
const {metadataToDbus} = require("./util")

class TracklistInterface extends MprisInterface {
    constructor(player) {
        super("org.mpris.MediaPlayer2.TrackList", player)
    }

    _Tracks = []

    _CanEditTracks = false

    setTracks(tracksPlain) {
        this.setProperty("Tracks", tracksPlain)
    }

    get Tracks() {
        return this._Tracks
    }

    get CanEditTracks() {
        return this._CanEditTracks
    }

    GetTracksMetadata(trackIds) {
        return this.player.tracks.filter(t => trackIds.some(
            id => id === t["mpris:trackid"])).map(metadataToDbus)
    }

    AddTrack(uri, afterTrack, setAsCurrent) {
        this.player.emit("addTrack", {afterTrack, setAsCurrent, uri})
    }

    RemoveTrack(trackId) {
        this.player.emit("removeTrack", trackId)
    }

    GoTo(trackId) {
        this.player.emit("goTo", trackId)
    }

    TrackListReplaced(replacedPlain) {
        this.setTracks(replacedPlain)
        // TODO what's the active track?
        return [
            this._Tracks,
            "/org/mpris/MediaPlayer2/TrackList/NoTrack"
        ]
    }

    TrackAdded(metadata) {
        return metadataToDbus(metadata)
    }

    TrackRemoved(path) {
        return path
    }

    TrackMetadataChanged(path, metadata) {
        return [
            path,
            metadataToDbus(metadata)
        ]
    }
}

TracklistInterface.configureMembers({
    "methods": {
        "AddTrack": {"inSignature": "sob"},
        "GetTracksMetadata": {"inSignature": "ao", "outSignature": "aa{sv}"},
        "GoTo": {"inSignature": "o"},
        "RemoveTrack": {"inSignature": "o"}
    },
    "properties": {
        "CanEditTracks": {"access": "read", "signature": "b"},
        "Tracks": {"access": "read", "signature": "ao"}
    },
    "signals": {
        "TrackAdded": {"signature": "a{sv}"},
        "TrackListReplaced": {"signature": "aoo"},
        "TrackMetadataChanged": {"signature": "a{sv}"},
        "TrackRemoved": {"signature": "o"}
    }
})

module.exports = TracklistInterface
