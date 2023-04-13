"use strict"

const {Variant} = require("dbus-next")

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
            "Next": {},
            "Previous": {},
            "Pause": {},
            "PlayPause": {},
            "Stop": {},
            "Play": {},
            "Seek": {"inSignature": "x"},
            "SetPosition": {"inSignature": "ox"},
            "OpenUri": {"inSignature": "s"},
            "ActivatePlaylist": {"inSignature": "o"},
            "GetPlaylists": {"inSignature": "uusb", "outSignature": "a(oss)"},
            "GetTracksMetadata": {"inSignature": "ao", "outSignature": "aa{sv}"},
            "AddTrack": {"inSignature": "sob"},
            "RemoveTrack": {"inSignature": "o"},
            "GoTo": {"inSignature": "o"},
            "Raise": {},
            "Quit": {},
        },
        "properties": {
            "CanControl": {"signature": "b", "access": "read"},
            "CanPause": {"signature": "b", "access": "read"},
            "CanPlay": {"signature": "b", "access": "read"},
            "CanSeek": {"signature": "b", "access": "read"},
            "CanGoNext": {"signature": "b", "access": "read"},
            "CanGoPrevious": {"signature": "b", "access": "read"},
            "Metadata": {"signature": "a{sv}", "access": "read"},
            "MaximumRate": {"signature": "d", "access": "read"},
            "MimimumRate": {"signature": "d", "access": "read"},
            "Rate": {"signature": "d"},
            "Shuffle": {"signature": "d"},
            "Volume": {"signature": "d"},
            "LoopStatus": {"signature": "s"},
            "PlaybackStatus": {"signature": "s", "access": "read"},
            "PlaylistCount": {"signature": "u", "access": "read"},
            "Orderings": {"signature": "as", "access": "read"},
            "ActivePlaylist": {"signature": "(b(oss))", "access": "read"},
            "Tracks": {"signature": "ao", "access": "read"},
            "CanEditTracks": {"signature": "b", "access": "read"},
            "CanQuit": {"signature": "b", "access": "read"},
            "Fullscreen": {"signature": "b"},
            "CanSetFullscreen": {"signature": "b", "access": "read"},
            "CanRaise": {"signature": "b", "access": "read"},
            "HasTrackList": {"signature": "b", "access": "read"},
            "Identity": {"signature": "s", "access": "read"},
            "DesktopEntry": {"signature": "s", "access": "read"},
            "SupportedUriSchemes": {"signature": "as", "access": "read"},
            "SupportedMimeTypes": {"signature": "as", "access": "read"},
        },
        "signals": {
            "Seeked": {"signature": "x"},
            "PlaylistChanged": {"signature": "(oss)"},
            "TrackListReplaced": {"signature": "aoo"},
            "TrackAdded": {"signature": "a{sv}"},
            "TrackRemoved": {"signature": "o"},
            "TrackMetadataChanged": {"signature": "a{sv}"}
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
