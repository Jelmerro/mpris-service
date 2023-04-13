"use strict"

const Player = require("mpris-service")

const player = Player({
    "name": "nodejs",
    "identity": "Node.js media player",
    "supportedUriSchemes": ["file"],
    "supportedMimeTypes": ["audio/mpeg", "application/ogg"],
    "supportedInterfaces": ["trackList"]
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
        "mpris:trackid": player.objectPath("track/0"),
        "mpris:length": 60 * 1000 * 1000,
        "mpris:artUrl": "http://example.org/image.jpg",
        "xesam:title": "Track 1 title",
        "xesam:album": "Track 1 album name",
        "xesam:artist": "Track 1 artist"
    },
    {
        "mpris:trackid": player.objectPath("track/1"),
        "mpris:length": 60 * 1000 * 1000,
        "mpris:artUrl": "file:///home/username/Pictures/example.png",
        "xesam:title": "Track 2 title",
        "xesam:album": "Track 2 album name",
        "xesam:artist": "Track 2 artist"
    }
]
