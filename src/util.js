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

const addDBusTypes = inf => {
    inf.configureMembers({
        "methods": {
            "ActivatePlaylist": {"inSignature": "o"},
            "AddTrack": {"inSignature": "sob"},
            "GetPlaylists": {"inSignature": "uusb", "outSignature": "a(oss)"},
            "GetTracksMetadata": {
                "inSignature": "ao", "outSignature": "aa{sv}"
            },
            "GoTo": {"inSignature": "o"},
            "Next": {},
            "OpenUri": {"inSignature": "s"},
            "Pause": {},
            "Play": {},
            "PlayPause": {},
            "Previous": {},
            "Quit": {},
            "Raise": {},
            "RemoveTrack": {"inSignature": "o"},
            "Seek": {"inSignature": "x"},
            "SetPosition": {"inSignature": "ox"},
            "Stop": {}
        },
        "properties": {
            "ActivePlaylist": {"access": "read", "signature": "(b(oss))"},
            "CanControl": {"access": "read", "signature": "b"},
            "CanEditTracks": {"access": "read", "signature": "b"},
            "CanGoNext": {"access": "read", "signature": "b"},
            "CanGoPrevious": {"access": "read", "signature": "b"},
            "CanPause": {"access": "read", "signature": "b"},
            "CanPlay": {"access": "read", "signature": "b"},
            "CanQuit": {"access": "read", "signature": "b"},
            "CanRaise": {"access": "read", "signature": "b"},
            "CanSeek": {"access": "read", "signature": "b"},
            "CanSetFullscreen": {"access": "read", "signature": "b"},
            "DesktopEntry": {"access": "read", "signature": "s"},
            "Fullscreen": {"signature": "b"},
            "HasTrackList": {"access": "read", "signature": "b"},
            "Identity": {"access": "read", "signature": "s"},
            "LoopStatus": {"signature": "s"},
            "MaximumRate": {"access": "read", "signature": "d"},
            "Metadata": {"access": "read", "signature": "a{sv}"},
            "MimimumRate": {"access": "read", "signature": "d"},
            "Orderings": {"access": "read", "signature": "as"},
            "PlaybackStatus": {"access": "read", "signature": "s"},
            "PlaylistCount": {"access": "read", "signature": "u"},
            "Rate": {"signature": "d"},
            "Shuffle": {"signature": "d"},
            "SupportedMimeTypes": {"access": "read", "signature": "as"},
            "SupportedUriSchemes": {"access": "read", "signature": "as"},
            "Tracks": {"access": "read", "signature": "ao"},
            "Volume": {"signature": "d"}
        },
        "signals": {
            "PlaylistChanged": {"signature": "(oss)"},
            "Seeked": {"signature": "x"},
            "TrackAdded": {"signature": "a{sv}"},
            "TrackListReplaced": {"signature": "aoo"},
            "TrackMetadataChanged": {"signature": "a{sv}"},
            "TrackRemoved": {"signature": "o"}
        }
    })
    return inf
}

const constants = {
    "LOOP_STATUS_NONE": "None",
    "LOOP_STATUS_PLAYLIST": "Playlist",
    "LOOP_STATUS_TRACK": "Track",
    "PLAYBACK_STATUS_PAUSED": "Paused",
    "PLAYBACK_STATUS_PLAYING": "Playing",
    "PLAYBACK_STATUS_STOPPED": "Stopped"
}

const playbackStatuses = [
    constants.PLAYBACK_STATUS_PLAYING,
    constants.PLAYBACK_STATUS_PAUSED,
    constants.PLAYBACK_STATUS_STOPPED
]

const loopStatuses = [
    constants.LOOP_STATUS_NONE,
    constants.LOOP_STATUS_PLAYLIST,
    constants.LOOP_STATUS_TRACK
]

constants.isLoopStatusValid = function(value) {
    return loopStatuses.includes(value)
}
constants.isPlaybackStatusValid = function(value) {
    return playbackStatuses.includes(value)
}

const lcfirst = str => str[0].toLowerCase() + str.substr(1)

module.exports = {
    addDBusTypes,
    constants,
    emptyPlaylist,
    lcfirst,
    metadataToDbus,
    metadataToPlain,
    playlistToDbus,
    playlistToPlain
}
