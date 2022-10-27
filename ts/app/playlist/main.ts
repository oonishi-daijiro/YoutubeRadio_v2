
import { Playlist } from "../../lib/config/main";
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
})



const animationNames = [
  'fade-out-to-right',
  'fade-out-to-left',
  'fade-in-from-left',
  'fade-in-from-right'
]

async function animate(dom:HTMLElement,animationName:string):Promise<void> {
  animationNames.forEach(e => {
    dom.classList.remove(e)
  })
  dom.classList.add(animationName)
  return new Promise((resolve, reject) => {

    dom.addEventListener('animationend', AnimationEndCallback)

    function AnimationEndCallback(): void {
      dom.removeEventListener('animationend',AnimationEndCallback)
      resolve()
  }
  })
}


const playlistDisplayWrapper = document.getElementById('playlist-display-wrapper')

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
      animate(playlistDisplayWrapper,'fade-out-to-left')
      new PlaylistDetailDisplay(playlist)
      animate(playlistDetailDisplayWrapper,'fade-in-from-right')
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
        animate(playlistDisplayWrapper,'fade-in-from-left')
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

    const buttonEdit = document.createElement('i')
    buttonEdit.className = 'fa-solid fa-pencil button-edit'
    buttonEdit.addEventListener('click', async () => {
      new PlaylistEditor(playlist)
      await Promise.all([
        animate(playlistDetailDisplayWrapper, 'fade-out-to-left'),
        animate(playlistEditorWrapper,'fade-in-from-right')
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

        const buttonRemove = document.createElement('i')
        buttonRemove.className = 'fas fa-times button-remove-video'
        buttonRemove.addEventListener('click', () => {
          videoDisplay.remove()
        })
        videoDisplay.appendChild(buttonRemove)
      } else {
        const iconMusic = document.createElement('i')
        iconMusic.className = 'fa-solid fa-music icon-music'
        videoDisplay.appendChild(iconMusic)
        videoTitleDisplay.style.pointerEvents = 'none'
      }


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

    const playlistNameEditor = document.createElement('input')
    playlistNameEditor.type = 'text'
    playlistNameEditor.id = 'playlist-name-editor'
    playlistNameEditor.value = playlist.name

    const buttonBack = document.createElement('i')
    buttonBack.className = 'fa-solid fa-arrow-left'
    buttonBack.id = 'button-back-to-playlist-detail'

    buttonBack.addEventListener('click', async() => {
      await Promise.all([
        animate(playlistEditorWrapper, 'fade-out-to-right'),
        animate(playlistDetailDisplayWrapper,'fade-in-from-left')
      ])
      playlistEditorWrapper.removeChild(playlistEditor)
    })

    playlistEditor.appendChild(buttonBack)
    playlistEditor.appendChild(thumbnail)
    playlistEditorWrapper.appendChild(playlistEditor)
  }
}

function htmlspecialchars(str: string) {
  return (str + '').replace(/&amp;/g, "&")
    .replace(/&quot;/g, '\"')
    .replace(/&#39;/g, '\'')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
