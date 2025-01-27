"use strict"

const {EventEmitter} = require("events")

const dbus = require("dbus-final")
const PlayerInterface = require("./player")
const RootInterface = require("./root")
const PlaylistsInterface = require("./playlists")
const TracklistInterface = require("./tracklist")
const {metadataToPlain, playlistToPlain, lcfirst} = require("./util")

const MPRIS_PATH = "/org/mpris/MediaPlayer2"

/**
 * Construct a new Player and export it on the DBus session bus.
 *
 * For more information about the properties of this class, see [the MPRIS DBus Interface Specification](https://specifications.freedesktop.org/mpris-spec/latest/).
 *
 * Method Call Events
 * ------------------
 *
 * The Player is an `EventEmitter` that emits events when the corresponding
 * methods are called on the DBus interface over the wire.
 *
 * The Player emits events whenever the corresponding methods on the DBus
 * interface are called.
 *
 * * `raise` - Brings the media player's user interface to the front using any appropriate mechanism available.
 * * `quit` - Causes the media player to stop running.
 * * `next` - Skips to the next track in the tracklist.
 * * `previous` - Skips to the previous track in the tracklist.
 * * `pause` - Pauses playback.
 * * `playPause` - Pauses playback.  If playback is already paused, resumes playback. If playback is stopped, starts playback.
 * * `stop` - Stops playback.
 * * `play` - Starts or resumes playback.
 * * `seek` - Seeks forward in the current track by the specified number of microseconds. With event data `offset`.
 * * `position` - Sets the current track position in microseconds. With event data `{ trackId, position }`.
 * * `open` - Opens the Uri given as an argument. With event data `{ uri }`.
 * * `volume` - Sets the volume of the player. With event data `volume` (between 0.0 and 1.0).
 * * `shuffle` - Sets whether shuffle is enabled on the player. With event data `shuffleStatus` (boolean).
 * * `rate` - Sets the playback rate of the player. A value of 1.0 is the normal rate. With event data `rate`.
 * * `loopStatus` - Sets the loop status of the player to either 'None', 'Track', or 'Playlist'. With event data `loopStatus`.
 * * `activatePlaylist` -  Starts playing the given playlist. With event data `playlistId`.
 *
 * The Player may also emit an `error` event with the underlying Node `Error`
 * as the event data. After receiving this event, the Player may be
 * disconnected.
 *
 * ```
 * player.on('play', () => {
 *   realPlayer.play();
 * });
 *
 * player.on('shuffle', (enableShuffle) => {
 *   realPlayer.setShuffle(enableShuffle);
 *   player.shuffle = enableShuffle;
 * });
 * ```
 *
 * Player Properties
 * -----------------
 *
 * Player properties (documented below) should be kept up to date to reflect
 * the state of your real player. These properties can be gotten by the client
 * through the `org.freedesktop.DBus.Properties` interface which will return
 * the value currently set on the player. Setting these properties on the
 * player to a different value will emit the `PropertiesChanged` signal on the
 * properties interface to notify clients that properties of the player have
 * changed.
 *
 * ```
 * realPlayer.on('shuffle:changed', (shuffleEnabled) => {
 *   player.shuffle = shuffleEnabled;
 * });
 *
 * realPlayer.on('play', () => {
 *   player.playbackStatus = 'Playing';
 * });
 * ```
 *
 * Player Position
 * ---------------
 *
 * Clients can get the position of your player by getting the `Position`
 * property of the `org.mpris.MediaPlayer2.Player` interface. Since position
 * updates continuously, {@link Player#getPosition} is implemented as a getter
 * you can override on your Player. This getter will be called when a client
 * requests the position and should return the position of your player for the
 * client in microseconds.
 *
 * ```
 * player.getPosition() {
 *   return realPlayer.getPositionInMicroseconds();
 * }
 * ```
 *
 * When your real player seeks to a new location, such as when someone clicks
 * on the time bar, you can notify clients of the new position by calling the
 * {@link Player#seeked} method. This will raise the `Seeked` signal on the
 * `org.mpris.MediaPlayer2.Player` interface with the given current time of the
 * player in microseconds.
 *
 * ```
 * realPlayer.on('seeked', (positionInMicroseconds) => {
 *   player.seeked(positionInMicroseconds);
 * });
 * ```
 *
 * Clients can request to set position using the `Seek` and `SetPosition`
 * methods of the `org.mpris.MediaPlayer2.Player` interface. These requests are
 * implemented as events on the Player similar to the other requests.
 *
 * ```
 * player.on('seek', (offset) => {
 *   // note that offset may be negative
 *   let currentPosition = realPlayer.getPositionInMicroseconds();
 *   let newPosition = currentPosition + offset;
 *   realPlayer.setPosition(newPosition);
 * });
 *
 * player.on('position', (event) => {
 *   // check that event.trackId is the current track before continuing.
 *   realPlayer.setPosition(event.position);
 * });
 * ```
 *
 * @class Player
 * @param {Object} options - Options for the player
 * @param {String} options.name - Name on the bus to export to as `org.mpris.MediaPlayer2.{name}`.
 * @param {String} options.identity - Identity for the player to display on the root media player interface.
 * @param {Array} options.supportedMimeTypes - Mime types this player can open with the `org.mpris.MediaPlayer2.Open` method.
 * @param {Array} options.supportedInterfaces - The interfaces this player supports. Can include `'player'`, `'playlists'`, and `'trackList'`.
 * @property {String} identity - A friendly name to identify the media player to users.
 * @property {Boolean} fullscreen - Whether the media player is occupying the fullscreen.
 * @property {Array} supportedUriSchemes - The URI schemes supported by the media player.
 * @property {Array} supportedMimeTypes - The mime-types supported by the media player.
 * @property {Boolean} canQuit - Whether the player can quit.
 * @property {Boolean} canRaise - Whether the player can raise.
 * @property {Boolean} canSetFullscreen - Whether the player can be set to fullscreen.
 * @property {Boolean} hasTrackList - Indicates whether the /org/mpris/MediaPlayer2 object implements the org.mpris.MediaPlayer2.TrackList interface.
 * @property {String} desktopEntry - The basename of an installed .desktop file which complies with the Desktop entry specification, with the ".desktop" extension stripped.
 * @property {String} playbackStatus - The current playback status. May be "Playing", "Paused" or "Stopped".
 * @property {String} loopStatus - The current loop/repeat status. May be "None", "Track", or "Playlist".
 * @property {Boolean} shuffle - Whether the player is shuffling.
 * @property {Object} metadata - The metadata of the current element. If there is a current track, this must have a "mpris:trackid" entry (of D-Bus type "o") at the very least, which contains a D-Bus path that uniquely identifies this track.
 * @property {Double} volume - The volume level.
 * @property {Boolean} canControl - Whether the media player may be controlled over this interface.
 * @property {Boolean} canPause - Whether playback can be paused using Pause or PlayPause.
 * @property {Boolean} canPlay - Whether playback can be started using Play or PlayPause.
 * @property {Boolean} canSeek - Whether the client can control the playback position using Seek and SetPosition.
 * @property {Boolean} canGoNext - Whether the client can call the Next method on this interface and expect the current track to change.
 * @property {Boolean} canGoPrevious - Whether the client can call the Previous method on this interface and expect the current track to change.
 * @property {Double} rate - The current playback rate.
 * @property {Double} minimumRate - The minimum value which the Rate property can take.
 * @property {Double} maximumRate - The maximum value which the Rate property can take.
 * @property {Array} playlists - The current playlists set by {@link Player#setPlaylists}. (Not a DBus property).
 * @property {String} activePlaylist - The id of the currently-active playlist.
 */
class Player extends EventEmitter {
    init(opts) {
        this.name = opts.name
        this.supportedInterfaces = opts.supportedInterfaces || ["player"]
        this._tracks = []
        this.serviceName = `org.mpris.MediaPlayer2.${this.name}`
        dbus.validators.assertBusNameValid(this.serviceName)
        this._bus = dbus.sessionBus()
        this._bus.on("error", err => this.emit("error", err))
        this._bus.on("message", msg => this.emit(msg))
        this.interfaces = {}
        this._addRootInterface(opts)
        if (this.supportedInterfaces.indexOf("player") >= 0) {
            this._addPlayerInterface()
        }
        if (this.supportedInterfaces.indexOf("trackList") >= 0) {
            this._addTracklistInterface()
        }
        if (this.supportedInterfaces.indexOf("playlists") >= 0) {
            this._addPlaylistsInterface()
        }
        for (const k of Object.keys(this.interfaces)) {
            const iface = this.interfaces[k]
            this._bus.export(MPRIS_PATH, iface)
        }
        this._bus.requestName(this.serviceName, dbus.NameFlag.DO_NOT_QUEUE)
            .then(reply => {
                if (reply === dbus.RequestNameReply.EXISTS) {
                    this.serviceName = `${this.serviceName}.instance${process.pid}`
                    return this._bus.requestName(this.serviceName)
                }
            })
            .catch(err => {
                this.emit("error", err)
            })
    }

    _addRootInterface(opts) {
        this.interfaces.root = new RootInterface(this, opts)
        this._addEventedPropertiesList(this.interfaces.root,
            ["Identity",
                "Fullscreen",
                "SupportedUriSchemes",
                "SupportedMimeTypes",
                "CanQuit",
                "CanRaise",
                "CanSetFullscreen",
                "HasTrackList",
                "DesktopEntry"])
    }

    _addPlayerInterface() {
        this.interfaces.player = new PlayerInterface(this)
        const eventedProps = ["PlaybackStatus",
            "LoopStatus",
            "Rate",
            "Shuffle",
            "Metadata",
            "Volume",
            "CanControl",
            "CanPause",
            "CanPlay",
            "CanSeek",
            "CanGoNext",
            "CanGoPrevious",
            "MinimumRate",
            "MaximumRate"]
        this._addEventedPropertiesList(this.interfaces.player, eventedProps)
    }

    _addTracklistInterface() {
        this.interfaces.tracklist = new TracklistInterface(this)
        this._addEventedPropertiesList(this.interfaces.tracklist, ["CanEditTracks"])
        Object.defineProperty(this, "tracks", {
            "configurable": true,
            "enumerable": true,
            "get"() {
                return this._tracks
            },
            "set"(value) {
                this._tracks = value
                this.interfaces.tracklist.TrackListReplaced(value)
            }
        })
    }

    _addPlaylistsInterface() {
        this.interfaces.playlists = new PlaylistsInterface(this)
        this._addEventedPropertiesList(this.interfaces.playlists,
            ["PlaylistCount", "ActivePlaylist"])
    }

    /**
     * Get a valid object path with the `subpath` as the basename which is suitable
     * for use as an id.
     *
     * @name Player#objectPath
     * @function
     * @param {String} subpath - The basename of this path
     * @returns {String} - A valid object path that can be used as an id.
     */
    objectPath(subpath) {
        let path = `/org/node/mediaplayer/${this.name}`
        if (subpath) {
            path += `/${subpath}`
        }
        return path
    }

    _addEventedProperty(iface, name) {
        const localName = lcfirst(name)
        Object.defineProperty(this, localName, {
            "configurable": true,
            "enumerable": true,
            "get"() {
                const value = iface[name]
                if (name === "ActivePlaylist") {
                    return playlistToPlain(value)
                }
                if (name === "Metadata") {
                    return metadataToPlain(value)
                }
                return value
            },
            "set"(value) {
                iface.setProperty(name, value)
            }
        })
    }

    _addEventedPropertiesList(iface, props) {
        for (let i = 0; i < props.length; i++) {
            this._addEventedProperty(iface, props[i])
        }
    }

    /**
     * Gets the position of this player. This method is intended to be overridden
     * by the user to return the position of the player in microseconds.
     *
     * @name Player#getPosition
     * @function
     * @returns {Integer} - The current position of the player in microseconds.
     */
    getPosition() {
        return 0
    }

    /**
     * Emits the `Seeked` DBus signal to listening clients with the given position.
     *
     * @name Player#seeked
     * @function
     * @param {Integer} position - The position in microseconds.
     */
    seeked(position) {
        const seekTo = Math.floor(position || 0)
        if (isNaN(seekTo)) {
            throw new Error(`seeked expected a number (got ${position})`)
        }
        this.interfaces.player.Seeked(seekTo)
    }

    getTrackIndex(trackId) {
        for (let i = 0; i < this.tracks.length; i++) {
            const track = this.tracks[i]
            if (track["mpris:trackid"] === trackId) {
                return i
            }
        }
        return -1
    }

    getTrack(trackId) {
        return this.tracks[this.getTrackIndex(trackId)]
    }

    addTrack(track) {
        this.tracks.push(track)
        this.interfaces.tracklist.setTracks(this.tracks)
        let afterTrack = "/org/mpris/MediaPlayer2/TrackList/NoTrack"
        if (this.tracks.length > 2) {
            afterTrack = this.tracks[this.tracks.length - 2]["mpris:trackid"]
        }
        this.interfaces.tracklist.TrackAdded(afterTrack)
    }

    removeTrack(trackId) {
        const i = this.getTrackIndex(trackId)
        this.tracks.splice(i, 1)
        this.interfaces.tracklist.setTracks(this.tracks)
        this.interfaces.tracklist.TrackRemoved(trackId)
    }

    /**
     * Get the index of a playlist entry in the `playlists` list property of the
     * player from the given id.
     *
     * @name Player#getPlaylistIndex
     * @function
     * @param {String} playlistId - The id for the playlist entry.
     */
    getPlaylistIndex(playlistId) {
        for (let i = 0; i < this.playlists.length; i++) {
            const playlist = this.playlists[i]
            if (playlist.Id === playlistId) {
                return i
            }
        }
        return -1
    }

    /**
     * Set the list of playlists advertised to listeners on the bus. Each playlist
     * must have string members `Id`, `Name`, and `Icon`.
     *
     * @name Player#setPlaylists
     * @function
     * @param {Array} playlists - A list of playlists.
     */
    setPlaylists(playlists) {
        this.playlists = playlists
        this.playlistCount = playlists.length
        const that = this
        this.playlists.forEach(playlist => {
            that.interfaces.playlists.PlaylistChanged(playlist)
        })
    }

    /**
     * Set the playlist identified by `playlistId` to be the currently active
     * playlist.
     *
     * @name Player#setActivePlaylist
     * @function
     * @param {String} playlistId - The id of the playlist to activate.
     */
    setActivePlaylist(playlistId) {
        this.interfaces.playlists.setActivePlaylistId(playlistId)
    }
}

let player = null
const getPlayer = opts => {
    if (!player) {
        player = new Player()
        player.init(opts)
    }
    return player
}

module.exports = getPlayer
