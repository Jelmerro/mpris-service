"use strict"

const Player = require("mpris-service")

const player = Player({
    "identity": "Node.js media player",
    "name": "nodejs",
    "supportedInterfaces": ["player"],
    "supportedMimeTypes": ["audio/mpeg", "application/ogg"],
    "supportedUriSchemes": ["file"]
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
        "mpris:artUrl": "file:///home/username/Pictures/example.png",
        "mpris:length": 60 * 1000 * 1000,
        "mpris:trackid": player.objectPath("track/0"),
        "xesam:album": "Track album",
        "xesam:artist": ["Artist name, can be an array or a single string"],
        "xesam:title": "Track title"
    }

    player.playbackStatus = "Playing"
}, 1000)

setTimeout(() => {
    player.seeked(0)
}, 2000)
