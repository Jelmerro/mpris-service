"use strict"

const Player = require("mpris-service")

const player = Player({
    "identity": "Node.js media player",
    "name": "nodejs",
    "supportedInterfaces": ["playlists"],
    "supportedMimeTypes": ["audio/mpeg", "application/ogg"],
    "supportedUriSchemes": ["file"]
})

player.on("quit", () => {
    process.exit()
})

player.on("activatePlaylist", playlistId => {
    console.info("Activate playlist:", playlistId)
    player.setActivePlaylist(playlistId)
})

player.setPlaylists([
    {
        "Icon": "",
        "Id": player.objectPath("playlist/0"),
        "Name": "The best playlist"
    },
    {
        "Icon": "",
        "Id": player.objectPath("playlist/1"),
        "Name": "The wonderful playlist"
    },
    {
        "Icon": "",
        "Id": player.objectPath("playlist/2"),
        "Name": "The sexyiest playlist"
    },
    {
        "Icon": "",
        "Id": player.objectPath("playlist/3"),
        "Name": "The coolest playlist"
    }
])
