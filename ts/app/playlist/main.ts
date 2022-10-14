
import { resolve } from "path";
import { Playlist, YoutubePlaylist } from "../../lib/config/main";
import { YoutubeRadioPreload, playlistNavigation } from "../../preload/playlist/preload";


interface preload extends Window {
  YoutubeRadio: YoutubeRadioPreload
}

declare const window: preload


window.addEventListener('load', async () => {
  const playlists = await window.YoutubeRadio.getPlaylists()
  playlists.forEach((pl, index) => {
    new PlaylistDisplay(pl)
  })
  new ButtonCreatePlaylist()
})

const playlistDisplayWrapper = document.getElementById('playlist-display-wrapper')


const buttonCloseWindow = document.createElement('i')
buttonCloseWindow.id = 'button-close-window'
buttonCloseWindow.className = 'fa-solid fa-xmark'
buttonCloseWindow.addEventListener('click', () => {
  window.YoutubeRadio.close()
})
playlistDisplayWrapper.appendChild(buttonCloseWindow)

class ButtonCreatePlaylist {
  constructor() {
    const button = document.createElement('div')
    button.className = 'button-create-playlist'

    const plusIcon = document.createElement('i')
    plusIcon.className = "fas fa-plus plus-icon"
    const buttonTextValue = document.createElement('div')
    buttonTextValue.textContent = "New Playlist"

    button.appendChild(plusIcon)
    button.appendChild(buttonTextValue)
    playlistDisplayWrapper.appendChild(button)
    button.addEventListener('click', () => {

    })
  }
}

class PlaylistDisplay {
  constructor(playlist: Playlist) {
    const display = document.createElement('div')
    display.className = 'playlist-display'
    const thumbnail = new Image()

    const thumbnailURL = `https://img.youtube.com/vi/${playlist.videoList[0].id}/sddefault.jpg`
    thumbnail.src = thumbnailURL
    thumbnail.className = "thumbnail"

    const playlistTitleDisplay = document.createElement('div')
    playlistTitleDisplay.textContent = playlist.name
    playlistTitleDisplay.className = 'playlist-title-display'

    playlistTitleDisplay.addEventListener('click', async () => {
      new PlaylistEditor(playlist)
      PlaylistEditor.activate()
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
  private static radioButton = document.getElementById('ui-state-holder-playlist-display') as HTMLInputElement
  static activate(): Promise<void> {
    PlaylistDisplay.radioButton.checked = true
    return new Promise((resolve, reject) => {
      playlistDisplayWrapper.addEventListener('animationend', () => {
        resolve()
      })
    })
  }
}


const playlistEditorWrapper = document.getElementById('playlist-editor-wrapper')

class PlaylistEditor {
  constructor(playlist: Playlist) {
    const playlistEditor = document.createElement('div')
    playlistEditor.className = 'playlist-editor'
    playlistEditorWrapper.appendChild(playlistEditor)


    const buttonBack = document.createElement('i')
    buttonBack.className = 'fa-solid fa-arrow-left'
    buttonBack.id = 'button-back'

    buttonBack.addEventListener('click', async () => {
      await PlaylistDisplay.activate()
      playlistEditorWrapper.innerHTML = ''
    })

    playlistEditor.appendChild(buttonBack)

    const videoListDisplay = createVideoDisplay(playlist)
    const playlistInfoDiplay = createPlaylistInfoDisplay(playlist)
    playlistEditor.appendChild(playlistInfoDiplay)
    playlistEditor.appendChild(videoListDisplay)
    this.editorDOM = playlistEditor
  }
  static activate(): Promise<void> {
    PlaylistEditor.radioButton.checked = true;
    return new Promise((resolve, reject) => {
      playlistEditorWrapper.addEventListener('animationend', () => {
        resolve()
      })
    })
  }
  private editorDOM: HTMLDivElement
  private static radioButton = document.getElementById('ui-state-holder-playlist-editor') as HTMLInputElement
}

function createPlaylistInfoDisplay(playlist: Playlist) {
  const playlistInfoDisplay = document.createElement('div')
  playlistInfoDisplay.id = "playlist-info-display"

  const thumbnail = document.createElement('img')
  thumbnail.src = `https://img.youtube.com/vi/${playlist.videoList[0].id}/sddefault.jpg`
  thumbnail.className = 'playlist-thumbnail'

  const playlistTitleDisplay = document.createElement('div')
  playlistTitleDisplay.textContent = playlist.name
  playlistTitleDisplay.id = 'playlist-title-display'

  const buttonPlay = document.createElement('i')
  buttonPlay.className = "fa-solid fa-play button-play navigator"

  buttonPlay.addEventListener('click', () => {
    window.YoutubeRadio.loadPlaylist(playlist.name)
    window.YoutubeRadio.close()
  })

  const buttonShuffle = document.createElement('i')

  buttonShuffle.className = "fa-solid fa-shuffle button-shuffle navigator"

  buttonShuffle.addEventListener('click', () => {

    function getRandomInt(min: number, max: number): number {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }

    window.YoutubeRadio.navigatePlaylist({
      name: playlist.name,
      index: getRandomInt(1, playlist.videoList.length),
      shuffle: true
    })
    window.YoutubeRadio.close()
  })

  const buttonDelete = document.createElement('i')
  buttonDelete.className = "fa-solid fa-trash button-remove navigator"

  buttonDelete.addEventListener('click', () => {
    window.YoutubeRadio.deletePlaylist(playlist.name)
    window.YoutubeRadio.close()
  })

  if (playlist.playlistID) {
    const playlistURLDisplay = document.createElement('div')
    playlistURLDisplay.textContent = `youtube.com/playlist?list=${playlist.playlistID}`
  }

  const playlistNavigator = document.createElement('div')
  playlistNavigator.id = "playlist-navigator"
  playlistNavigator.appendChild(buttonPlay)
  playlistNavigator.appendChild(buttonShuffle)
  playlistNavigator.appendChild(buttonDelete)

  const titleDisplayAndNavigator = document.createElement('div')
  titleDisplayAndNavigator.id = 'title-display-and-navigator'

  titleDisplayAndNavigator.appendChild(playlistTitleDisplay)
  titleDisplayAndNavigator.appendChild(playlistNavigator)

  playlistInfoDisplay.appendChild(thumbnail)
  playlistInfoDisplay.appendChild(titleDisplayAndNavigator)
  return playlistInfoDisplay

}

function createVideoDisplay(playlist: Playlist): HTMLDivElement {

  const videoListDisplay = document.createElement('div')
  videoListDisplay.className = 'videolist-display'

  playlist.videoList.forEach((e, index: number) => {
    const id = e.id
    const title = e.title
    const isYoutubePlaylist = playlist.playlistID as unknown as boolean

    const videoDisplay = document.createElement('div')
    const videoUrlDisplay = document.createElement('input')
    videoUrlDisplay.spellcheck = false
    videoDisplay.className = 'video-display'
    videoUrlDisplay.className = 'video-url-display charter-display'
    videoUrlDisplay.type = 'text'
    videoUrlDisplay.value = `youtube.com/watch?v=${id}`

    const videoTitleDisplay = document.createElement('input')
    videoTitleDisplay.spellcheck = false
    videoTitleDisplay.className = 'video-title-display charter-display'
    videoTitleDisplay.type = 'text'

    const buttonPlayVideo = document.createElement('i')
    buttonPlayVideo.className = 'fa-solid fa-play button-playvideo'

    buttonPlayVideo.addEventListener('click', () => {
      window.YoutubeRadio.navigatePlaylist({
        name: playlist.name,
        index: index,
        shuffle: false
      })
      window.YoutubeRadio.close()
    })
    videoTitleDisplay.value = htmlspecialchars(title)

    if (!isYoutubePlaylist) {
      const buttonRemove = document.createElement('i')
      buttonRemove.className = 'fas fa-times button-remove'
      buttonRemove.addEventListener('click', () => {
        videoDisplay.remove()
      })
      videoDisplay.appendChild(buttonRemove)
    } else {
      const iconMusic = document.createElement('i')
      iconMusic.className = 'fa-solid fa-music icon-music'
      videoDisplay.appendChild(iconMusic)
    }

    videoTitleDisplay.addEventListener('focus', event => {
      event.stopPropagation()
      videoTitleDisplay.style.display = 'none'
      videoUrlDisplay.style.display = 'flex'
      videoUrlDisplay.focus()
    })

    videoUrlDisplay.addEventListener('focusout', event => {
      event.stopPropagation()
      videoUrlDisplay.style.display = 'none'
      videoTitleDisplay.style.display = 'flex'
    })
    videoDisplay.appendChild(videoUrlDisplay)
    videoDisplay.appendChild(videoTitleDisplay)
    videoDisplay.appendChild(buttonPlayVideo)
    videoListDisplay.appendChild(videoDisplay)
  })

  return videoListDisplay
}

function htmlspecialchars(str: string) {
  return (str + '').replace(/&amp;/g, "&")
    .replace(/&quot;/g, '\"')
    .replace(/&#39;/g, '\'')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
