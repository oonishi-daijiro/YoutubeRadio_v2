import { Playlist } from "../../lib/config/main";
import YoutubeRadioPreload from "../../preload/playlist/preload";


interface preload extends Window {
  YoutubeRadio: YoutubeRadioPreload
}

declare const window: preload


window.addEventListener('load', async () => {
  const playlists = await window.YoutubeRadio.getPlaylists()
  playlists.forEach((pl, index) => {
    new PlaylistDisplay(pl, index)
  })
  new ButtonCreatePlaylist()
})

const playlistDisplayWrapper = document.getElementById('playlist-display-wrapper')

class ButtonCreatePlaylist {
  constructor() {
    const button = document.createElement('div')
    button.className = 'button-create-playlist'

    const plusIcon = document.createElement('i')
    plusIcon.className = "fas fa-plus plus-icon"

    button.appendChild(plusIcon)

    playlistDisplayWrapper.appendChild(button)

    button.addEventListener('click', () => {

    })
  }
}


class PlaylistDisplay {
  constructor(playlist: Playlist, index: number) {
    const display = document.createElement('div')
    display.className = 'playlist-display'
    const thumbnail = new Image()

    const thumbnailURL = `https://img.youtube.com/vi/${playlist.videoList[0].id}/sddefault.jpg`
    thumbnail.src = thumbnailURL
    thumbnail.className = "thumbnail"

    const playlistTitleDisplay = document.createElement('div')
    playlistTitleDisplay.textContent = playlist.name
    playlistTitleDisplay.className = 'playlist-title-display'

    playlistTitleDisplay.addEventListener('click', () => {
      window.YoutubeRadio.openEditPlaylist(playlist.name)
      window.YoutubeRadio.close()
    })

    const playButton = document.createElement('i')
    playButton.className = 'fas fa-play play-button'

    playButton.addEventListener('click', () => {
      window.YoutubeRadio.loadPlaylist(playlist.name)
      window.YoutubeRadio.close()
    })

    display.appendChild(thumbnail)
    display.appendChild(playlistTitleDisplay)
    display.appendChild(playButton)
    playlistDisplayWrapper.appendChild(display)
    this.dom = display
  }
  static listLength: number = 0
  protected dom: HTMLDivElement
}

