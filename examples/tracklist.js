"use strict"

const Player = require("mpris-service")

const player = Player({
    "identity": "Node.js media player",
    "name": "nodejs",
    "supportedInterfaces": ["trackList"],
    "supportedMimeTypes": ["audio/mpeg", "application/ogg"],
    "supportedUriSchemes": ["file"]
})

// Events
const events = ["addTrack", "removeTrack", "goTo"]
events.forEach(eventName => {
    player.on(eventName, (...args) => {
        console.info("Event:", eventName, ...args)
    })
})

player.tracks = [
    {
        "mpris:artUrl": "http://example.org/image.jpg",
        "mpris:length": 60 * 1000 * 1000,
        "mpris:trackid": player.objectPath("track/0"),
        "xesam:album": "Track 1 album name",
        "xesam:artist": "Track 1 artist",
        "xesam:title": "Track 1 title"
    },
    {
        "mpris:artUrl": "file:///home/username/Pictures/example.png",
        "mpris:length": 60 * 1000 * 1000,
        "mpris:trackid": player.objectPath("track/1"),
        "xesam:album": "Track 2 album name",
        "xesam:artist": "Track 2 artist",
        "xesam:title": "Track 2 title"
    }
]
