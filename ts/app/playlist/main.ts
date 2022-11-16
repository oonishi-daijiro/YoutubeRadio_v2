
import { Playlist, YoutubeVideo, youtubeVideoInfo } from "../../lib/config/main";
import { YoutubeRadioPreload } from "../../preload/playlist/preload";


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
  window.YoutubeRadio.emitWindowGetReady()
})

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function createChild<K extends keyof HTMLElementTagNameMap>(parentDom: HTMLElement, tagName: K): HTMLElement {
  const child = document.createElement(tagName)
  parentDom.appendChild(child)
  return child
}

function htmlspecialchars(str: string) {
  return (str + '').replace(/&amp;/g, "&")
    .replace(/&quot;/g, '\"')
    .replace(/&#39;/g, '\'')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}


async function animate(dom: HTMLElement, animationName: string): Promise<void> {

  const animationNames = [
    'fade-out-to-right',
    'fade-out-to-left',
    'fade-in-from-left',
    'fade-in-from-right',
    'fade-away'
  ]

  animationNames.forEach(e => {
    dom.classList.remove(e)
  })
  dom.classList.add(animationName)
  return new Promise((resolve, reject) => {

    dom.addEventListener('animationend', AnimationEndCallback)

    function AnimationEndCallback(): void {
      dom.removeEventListener('animationend', AnimationEndCallback)
      resolve()
    }
  })
}



class ButtonCreatePlaylist {
  constructor() {
    const button = document.createElement('div')
    button.className = 'button-create-playlist'

    const plusIcon = document.createElement('i')
    plusIcon.className = "fas fa-plus plus-icon"
    const buttonTextValue = document.createElement('div')
    buttonTextValue.id = 'new-playlist-text'
    buttonTextValue.textContent = "New Playlist"

    button.appendChild(plusIcon)
    button.appendChild(buttonTextValue)
    playlistDisplayWrapper.appendChild(button)
    button.addEventListener('click', () => {

    })
  }
}
const playlistDisplayWrapper = document.getElementById('playlist-display-wrapper')

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
      animate(playlistDisplayWrapper, 'fade-out-to-left')
      new PlaylistDetailDisplay(playlist)
      animate(playlistDetailDisplayWrapper, 'fade-in-from-right')
    })

    const playButton = document.createElement('i')
    playButton.className = 'fas fa-play play-button'

    playButton.addEventListener('click', () => {
      window.YoutubeRadio.navigatePlaylist({
        name: playlist.name,
        index: 0,
        shuffle: playlist.isShuffle
      })
      window.YoutubeRadio.close()
    })

    display.appendChild(thumbnail)
    display.appendChild(playlistTitleDisplay)
    display.appendChild(playButton)
    playlistDisplayWrapper.appendChild(display)
  }

}


const playlistDetailDisplayWrapper = document.getElementById('playlist-detail-display-wrapper')

class PlaylistDetailDisplay {
  constructor(playlist: Playlist) {
    const detailDisplay = document.createElement('div')
    detailDisplay.className = 'playlist-detail-display'
    playlistDetailDisplayWrapper.appendChild(detailDisplay)


    const buttonBack = document.createElement('i')
    buttonBack.className = 'fa-solid fa-arrow-left'
    buttonBack.id = 'button-back-to-playlist-display'

    buttonBack.addEventListener('click', async () => {
      await Promise.all([
        animate(playlistDetailDisplayWrapper, 'fade-out-to-right'),
        animate(playlistDisplayWrapper, 'fade-in-from-left')
      ])
      playlistDetailDisplayWrapper.removeChild(detailDisplay)
    })

    detailDisplay.appendChild(buttonBack)

    const videoListDisplay = PlaylistDetailDisplay.createVideoDisplay(playlist)
    const playlistInfoDiplay = PlaylistDetailDisplay.createPlaylistInfoDisplay(playlist)
    detailDisplay.appendChild(playlistInfoDiplay)
    detailDisplay.appendChild(videoListDisplay)
  }
  private static createPlaylistInfoDisplay(playlist: Playlist) {
    const isYoutubePlaylist = playlist.playlistID as unknown as boolean
    const playlistInfoDisplay = document.createElement('div')
    playlistInfoDisplay.id = "playlist-info-display"

    const thumbnail = document.createElement('img')
    thumbnail.src = `https://img.youtube.com/vi/${playlist.videoList[0].id}/sddefault.jpg`
    thumbnail.className = 'playlist-thumbnail'

    interface ext4webkit extends CSSStyleDeclaration {
      appRegion: string
    }


    playlistDisplayWrapper.addEventListener('animationend', () => {
      (thumbnail.style as ext4webkit).appRegion = 'drag'
    })

    const playlistNameDisplayWrapper = document.createElement('div')
    const playlistNameDisplay = document.createElement('div')
    playlistNameDisplay.textContent = playlist.name
    playlistNameDisplay.spellcheck = false
    playlistNameDisplay.id = 'playlist-title-display'
    playlistNameDisplayWrapper.appendChild(playlistNameDisplay)
    playlistNameDisplayWrapper.id = 'playlist-name-display-wrapper'

    const buttonPlay = document.createElement('i')
    buttonPlay.className = "fa-solid fa-play button-play navigator"

    buttonPlay.addEventListener('click', () => {
      window.YoutubeRadio.navigatePlaylist({
        name: playlist.name,
        shuffle: playlist.isShuffle,
        index: playlist.isShuffle ? getRandomInt(0, playlist.videoList.length) : 0
      })
      window.YoutubeRadio.close()
    })

    const buttonShuffle = document.createElement('i')
    buttonShuffle.className = "fa-solid fa-shuffle button-shuffle navigator"

    if (!playlist.isShuffle) {
      buttonShuffle.style.color = '#A6A6A6'
    }

    buttonShuffle.addEventListener('click', async () => {
      playlist.isShuffle = !playlist.isShuffle
      buttonShuffle.style.color = playlist.isShuffle ? '#353535' : '#A6A6A6'
      await window.YoutubeRadio.setPlaylist(playlist)
    })

    const buttonDelete = document.createElement('i')
    buttonDelete.className = "fa-solid fa-trash button-remove navigator"

    buttonDelete.addEventListener('click', () => {
      window.YoutubeRadio.deletePlaylist(playlist.name)
      window.YoutubeRadio.close()
    })

    const buttonEdit = document.createElement('i')
    buttonEdit.className = 'fa-solid fa-pencil button-edit'
    buttonEdit.addEventListener('click', async () => {
      new PlaylistEditor(playlist)
      await Promise.all([
        animate(playlistDetailDisplayWrapper, 'fade-out-to-left'),
        animate(playlistEditorWrapper, 'fade-in-from-right')
      ])
    })

    const playlistNavigator = document.createElement('div')
    playlistNavigator.id = "playlist-navigator"
    playlistNavigator.appendChild(buttonPlay)
    playlistNavigator.appendChild(buttonShuffle)
    playlistNavigator.appendChild(buttonDelete)
    playlistNavigator.appendChild(buttonEdit)

    if (isYoutubePlaylist) {
      const youtubePlaylistURLDisplay = document.createElement('div')
      youtubePlaylistURLDisplay.spellcheck = false
      youtubePlaylistURLDisplay.className = 'yt-playlist-url-display'
      youtubePlaylistURLDisplay.textContent = `www.youtube.com/playlist?list=${playlist.playlistID}`
      playlistNavigator.appendChild(youtubePlaylistURLDisplay)
    }


    const titleDisplayAndNavigator = document.createElement('div')
    titleDisplayAndNavigator.id = 'name-display-and-navigator'

    titleDisplayAndNavigator.appendChild(playlistNameDisplayWrapper)
    titleDisplayAndNavigator.appendChild(playlistNavigator)

    playlistInfoDisplay.appendChild(thumbnail)
    playlistInfoDisplay.appendChild(titleDisplayAndNavigator)
    return playlistInfoDisplay

  }
  private static createVideoDisplay(playlist: Playlist): HTMLDivElement {

    const videoListDisplay = document.createElement('div')
    videoListDisplay.className = 'videolist-display'

    playlist.videoList.forEach((e, index: number) => {
      const id = e.id
      const title = e.title

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
          shuffle: playlist.isShuffle
        })
        window.YoutubeRadio.close()
      })
      videoTitleDisplay.value = htmlspecialchars(title)

      const iconMusic = document.createElement('i')
      iconMusic.className = 'fa-solid fa-music icon-music'
      videoDisplay.appendChild(iconMusic)
      videoTitleDisplay.style.pointerEvents = 'none'

      videoDisplay.appendChild(videoUrlDisplay)
      videoDisplay.appendChild(videoTitleDisplay)
      videoDisplay.appendChild(buttonPlayVideo)
      videoListDisplay.appendChild(videoDisplay)
    })

    return videoListDisplay
  }
}

const playlistEditorWrapper = document.getElementById('playlist-editor-wrapper')

class PlaylistEditor {
  constructor(playlist: Playlist) {
    const playlistEditor = document.createElement('div')
    playlistEditor.id = 'playlist-editor'

    const thumbnail = new Image()
    const thumbnailURL = `https://img.youtube.com/vi/${playlist.videoList[0].id}/sddefault.jpg`
    thumbnail.src = thumbnailURL
    thumbnail.className = 'thumbnail-playlist-editor'

    const playlistNameEditorWrapper = document.createElement('div')
    playlistNameEditorWrapper.id = 'palylist-name-editor-wrapper'
    const playlistNameEditor = document.createElement('input')

    playlistNameEditor.spellcheck = false
    playlistNameEditor.type = 'text'
    playlistNameEditor.id = 'playlist-name-editor'
    playlistNameEditor.value = playlist.name
    playlistNameEditorWrapper.appendChild(playlistNameEditor)

    playlistNameEditorWrapper.addEventListener('click', event => {
      playlistNameEditor.focus()
    })

    const videoContentDisplay = document.createElement('div')
    videoContentDisplay.id = 'editor-video-content-display'


    if (playlist.playlistID) {
      const playlistURLDisplay = document.createElement('input')
      playlistURLDisplay.type = 'text'
      playlistURLDisplay.value = `www.youtube.com/playlist?list=${playlist.playlistID}`

      videoContentDisplay.appendChild(playlistURLDisplay)
    } else {
      playlist.videoList.forEach((e: YoutubeVideo, index: number) => {

        const videoDisplay = document.createElement('div')
        videoDisplay.className = 'editor-video-display'

        const buttonRemoveVideo = document.createElement('i')
        buttonRemoveVideo.className = 'fas fa-times button-remove-video'

        buttonRemoveVideo.addEventListener('click', async () => {
          await animate(videoDisplay, 'fade-away')
          videoDisplay.remove()
          playlist.videoList.splice(index, 1)
        })

        const displayTitleAndURL = new PlaylistEditor.DisplayURLAndTitle(e.id, e.title)

        displayTitleAndURL.title.addEventListener('focus', (event) => {
          event.stopPropagation()
          displayTitleAndURL.title.style.display = 'none'
          displayTitleAndURL.url.style.display = 'flex'
          displayTitleAndURL.url.focus()
        })

        displayTitleAndURL.url.addEventListener('focusout', async (event) => {
          event.stopPropagation()
          displayTitleAndURL.url.style.display = 'none'
          displayTitleAndURL.title.style.display = 'flex'
        })
        videoDisplay.appendChild(buttonRemoveVideo)
        videoDisplay.appendChild(displayTitleAndURL.title)
        videoDisplay.appendChild(displayTitleAndURL.url)

        videoContentDisplay.appendChild(videoDisplay)
      })


      const buttonAddVideo = document.createElement('i')
      buttonAddVideo.id = 'button-add-video'
      buttonAddVideo.className = 'fas fa-plus-circle'

      buttonAddVideo.addEventListener('click', () => {
        const videoDisplay = document.createElement('div')

        const buttonRemoveVideo = document.createElement('i')
        buttonRemoveVideo.className = 'fas fa-times button-remove-video'

        buttonRemoveVideo.addEventListener('click', async () => {
          await animate(videoDisplay, 'fade-away')
          videoDisplay.remove()

        })
        videoDisplay.appendChild(buttonRemoveVideo)

        videoDisplay.className = 'editor-video-display'

        const displayURLAndTitle = new PlaylistEditor.DisplayURLAndTitle("", "")
        displayURLAndTitle.title.style.display = 'none'
        displayURLAndTitle.url.style.display = 'flex'
        displayURLAndTitle.url.placeholder = 'Youtube URL'
        videoDisplay.appendChild(displayURLAndTitle.url)
        videoDisplay.appendChild(displayURLAndTitle.title)
        displayURLAndTitle.url.focus()
        buttonAddVideo.before(videoDisplay)
        videoContentDisplay.scrollTo(0, videoDisplay.offsetTop)
      })

      videoContentDisplay.appendChild(buttonAddVideo)
    }

    const buttonBack = document.createElement('i')
    buttonBack.className = 'fa-solid fa-arrow-left'
    buttonBack.id = 'button-back-to-playlist-detail'

    buttonBack.addEventListener('click', async () => {
      await Promise.all([
        animate(playlistEditorWrapper, 'fade-out-to-right'),
        animate(playlistDetailDisplayWrapper, 'fade-in-from-left')
      ])
      playlistEditorWrapper.removeChild(playlistEditor)
    })

    playlistEditor.appendChild(buttonBack)
    playlistEditor.appendChild(thumbnail)
    playlistEditor.appendChild(playlistNameEditorWrapper)
    playlistEditor.appendChild(videoContentDisplay)
    playlistEditorWrapper.appendChild(playlistEditor)
  }
  private static DisplayURLAndTitle = class {
    constructor(id: string, title: string = "") {
      const videoTitleDisplay = document.createElement('input')
      videoTitleDisplay.type = 'text'
      videoTitleDisplay.className = 'charter-display'
      videoTitleDisplay.value = htmlspecialchars(title)

      const videoUrlDisplay = document.createElement('input')
      videoUrlDisplay.className = 'charter-display'
      videoUrlDisplay.type = 'text'
      videoUrlDisplay.value = id != "" ? `www.youtube.com/watch?v=${htmlspecialchars(id)}` : ""
      videoUrlDisplay.style.display = 'none'
      videoUrlDisplay.readOnly = title == "" ? false : true

      videoUrlDisplay.addEventListener('focusout', async () => {
        if (videoTitleDisplay.value === "") {
          const title = await window.YoutubeRadio.getYoutubeTitle(videoUrlDisplay.value)
          videoUrlDisplay.readOnly = title == "" ? false : true
          if (title !== "") {
            videoTitleDisplay.value = title
            videoTitleDisplay.style.display = 'flex'
            videoUrlDisplay.style.display = 'none'

            videoTitleDisplay.addEventListener('focus', () => {
              event.stopPropagation()
              videoTitleDisplay.style.display = 'none'
              videoUrlDisplay.style.display = 'flex'
              videoUrlDisplay.focus()
            })

            videoUrlDisplay.addEventListener('focusout', () => {
              event.stopPropagation()
              videoUrlDisplay.style.display = 'none'
              videoTitleDisplay.style.display = 'flex'
            })
          }
        }
      })

      this.title = videoTitleDisplay
      this.url = videoUrlDisplay
    }
    url: HTMLInputElement
    title: HTMLInputElement
  }
}
