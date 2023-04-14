"use strict"

const MprisInterface = require("./mpris-interface")
const {emptyPlaylist, playlistToDbus} = require("./util")

class PlaylistsInterface extends MprisInterface {
    constructor(player) {
        super("org.mpris.MediaPlayer2.Playlists", player)
    }

    _ActivePlaylist = [false, emptyPlaylist]

    _PlaylistCount = 0

    get PlaylistCount() {
        return this._PlaylistCount
    }

    get Orderings() {
        return ["Alphabetical", "UserDefined"]
    }

    get ActivePlaylist() {
        return this._ActivePlaylist
    }

    setActivePlaylistId(playlistId) {
        const i = this.player.getPlaylistIndex(playlistId)
        this.setProperty("ActivePlaylist", this.player.playlists[i] || null)
    }

    ActivatePlaylist(playlistId) {
        this.player.emit("activatePlaylist", playlistId)
    }

    GetPlaylists(index, maxCount, order, reverseOrder) {
        if (!this.player.playlists) {
            return []
        }
        const result = this.player.playlists.sort((a, b) => {
            let ret = 1
            if (order === "Alphabetical") {
                ret = a.Name > b.Name ? 1 : -1
            }
            // TODO: CreationDate, ModifiedDate, LastPlayDate, UserDefined
            return ret
        })
            .slice(index, maxCount + index)
            .map(playlistToDbus)
        if (reverseOrder) {
            result.reverse()
        }
        return result
    }

    PlaylistChanged(playlist) {
        return playlistToDbus(playlist)
    }
}

PlaylistsInterface.configureMembers({
    "methods": {
        "ActivatePlaylist": {"inSignature": "o"},
        "GetPlaylists": {"inSignature": "uusb", "outSignature": "a(oss)"}
    },
    "properties": {
        "ActivePlaylist": {"access": "read", "signature": "(b(oss))"},
        "Orderings": {"access": "read", "signature": "as"},
        "PlaylistCount": {"access": "read", "signature": "u"}
    },
    "signals": {
        "PlaylistChanged": {"signature": "(oss)"}
    }
})

module.exports = PlaylistsInterface
