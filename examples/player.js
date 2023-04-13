"use strict"

const Player = require("mpris-service")

const player = Player({
    "name": "nodejs",
    "identity": "Node.js media player",
    "supportedUriSchemes": ["file"],
    "supportedMimeTypes": ["audio/mpeg", "application/ogg"],
    "supportedInterfaces": ["player"]
})

player.getPosition = function() {
    // Return the position of your player
    return 0
}

// Events
const events = [
    "raise",
    "quit",
    "next",
    "previous",
    "pause",
    "playpause",
    "stop",
    "play",
    "seek",
    "position",
    "open",
    "volume",
    "loopStatus",
    "shuffle"
]
events.forEach(eventName => {
    player.on(eventName, (...args) => {
        console.info("Event:", eventName, ...args)
    })
})

player.on("quit", () => {
    process.exit()
})

setTimeout(() => {
    // @see http://www.freedesktop.org/wiki/Specifications/mpris-spec/metadata/
    player.metadata = {
        "mpris:trackid": player.objectPath("track/0"),
        "mpris:length": 60 * 1000 * 1000,
        "mpris:artUrl": "file:///home/username/Pictures/example.png",
        "xesam:title": "Track title",
        "xesam:album": "Track album",
        "xesam:artist": ["Artist name, can be an array or a single string"]
    }

    player.playbackStatus = Player.PLAYBACK_STATUS_PLAYING
}, 1000)

setTimeout(() => {
    player.seeked(0)
}, 2000)
