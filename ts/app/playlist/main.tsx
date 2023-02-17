import * as React from "react";
import * as ReactDOM from "react-dom";

import { Playlist, playlistInfo, YoutubeVideo, youtubeVideoInfo } from "../../lib/config/main";
import { YoutubeRadioPreload } from "../../preload/playlist/preload";

console.log(<div>hello world</div>);



interface preload extends Window {
  YoutubeRadio: YoutubeRadioPreload
}

interface ext4webkit extends CSSStyleDeclaration {
  appRegion: string
}

declare const window: preload


window.addEventListener('load', async () => {
  const playlists = await window.YoutubeRadio.getPlaylists()
  new PlaylistDisplay(playlists)
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

function removeAllChildes(...doms: HTMLElement[]) {
  doms.forEach(dom => {
    while (dom.firstChild) {
      dom.removeChild(dom.firstChild)
    }
  })
}

function htmlspecialchars(str: string) {
  return (str + '').replace(/&amp;/g, "&")
    .replace(/&quot;/g, '\"')
    .replace(/&#39;/g, '\'')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}


type AnimationNames = 'fade-out-to-right' | 'fade-out-to-left' | 'fade-in-from-left' | 'fade-in-from-right' | 'fade-away'

function animate(dom: HTMLElement, animationName: AnimationNames): Promise<void> {
  const animationNames = [
    'fade-out-to-right',
    'fade-out-to-left',
    'fade-in-from-left',
    'fade-in-from-right',
    'fade-away'
  ]
  animationNames.forEach(name => {
    dom.classList.remove(name)
  })
  dom.classList.add(animationName)
  dom.style.pointerEvents = 'none'
  return new Promise((resolve, reject) => {

    dom.addEventListener('animationend', animationEndCallback)

    function animationEndCallback(): void {
      dom.removeEventListener('animationend', animationEndCallback)
      dom.style.pointerEvents = 'auto'
      resolve()
    }

  })
}

function isValidYoutubePlaylistUrl(url: string): boolean {

  const conditions: Array<boolean> = []
  const p = !window.YoutubeRadio.parse(url, true).protocol ? window.YoutubeRadio.parse(`https://${url}`, true) : window.YoutubeRadio.parse(url, true)
  conditions.push(p.hostname === 'www.youtube.com')

  conditions.push(p.hostname === 'www.youtube.com')
  if ((p.query as any).list === undefined) {
    return false
  }
  conditions.push((p.query as any).list.length === 34)

  return conditions.reduce((before, current) => before && current)
}

async function isValidPlaylistName(name: string, currentPlaylistName: string): Promise<boolean> {
  const conditions: Array<boolean> = []
  const currentPlaylists = await window.YoutubeRadio.getPlaylists()
  conditions.push(name !== "")
  conditions.push(name.length !== 0)
  if (currentPlaylistName !== name) {
    conditions.push(!currentPlaylists.map(e => e.name).includes(name))
  }
  return conditions.reduce((previous, current) => previous && current)
}

function isValidYoutubeURL(url: string): boolean {
  const conditions: Array<boolean> = []
  const pu = !window.YoutubeRadio.parse(url, true).protocol ? window.YoutubeRadio.parse(`https://${url}`, true) : window.YoutubeRadio.parse(url, true)
  conditions.push(pu.hostname === 'www.youtube.com')
  if ((pu.query as any).v === undefined) {
    return false
  }
  conditions.push((pu.query as any).v.length === 11)
  return conditions.reduce((previous, current) => previous && current)

}

function isValidVideos(videos: YoutubeVideo[]): boolean {
  const conditions: Array<boolean> = []
  conditions.push(videos.length < 100)
  conditions.push(videos.map(video => {
    return isValidYoutubeURL(`https://www.youtube.com/watch?v=${video.id}`)
  }).reduce((previous, current) => {
    return previous && current
  }))
  return conditions.reduce((previous, current) => previous && current)
}

async function reloadPlaylistsAndUI(animateFunction: () => Promise<any>): Promise<void> {
  const playlists = await window.YoutubeRadio.getPlaylists()
  removeAllChildes(playlistsDisplayWrapper)
  new PlaylistDisplay(playlists)
  await animateFunction()
  removeAllChildes(playlistDetailDisplayWrapper, playlistEditorWrapper)
  return;
}

function getYoutubeVideoIDFromURL(url: string): string {
  return (window.YoutubeRadio.parse(url, true).query as any).v ?? ""
}

function parseVideoURLs(videoURLs: HTMLInputElement[]): YoutubeVideo[] {
  return videoURLs.filter((url) => {
    return isValidYoutubeURL(url.value)
  }).map(input => {
    return {
      id: getYoutubeVideoIDFromURL(input.value),
      title: ""
    }
  })
}

interface editOption {
  currentPlaylistName: string
  newPlaylist: Playlist
}


const playlistsDisplayWrapper = document.getElementById('playlist-display-wrapper')

class PlaylistDisplay {
  constructor(readonly playlists: Playlist[]) {

    const playlistsDisplay = document.createElement('div')
    playlistsDisplay.id = 'playlists-display'

    playlists.forEach(playlist => {
      const playlistDisplay = document.createElement('div')
      const thumbnail = new Image()
      playlistDisplay.className = 'playlist-display'

      const thumbnailURL = `https://img.youtube.com/vi/${playlist.videos[0].id}/sddefault.jpg`
      thumbnail.src = thumbnailURL
      thumbnail.className = "thumbnail"

      const playlistTitleDisplay = document.createElement('div')
      playlistTitleDisplay.textContent = playlist.name
      playlistTitleDisplay.className = 'playlist-title-display'

      playlistTitleDisplay.addEventListener('click', async () => {
        animate(playlistsDisplayWrapper, 'fade-out-to-left')
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

      playlistDisplay.appendChild(thumbnail)
      playlistDisplay.appendChild(playlistTitleDisplay)
      playlistDisplay.appendChild(playButton)
      playlistsDisplay.appendChild(playlistDisplay)
    })

    const buttonCreatePlaylist = document.createElement('div')
    buttonCreatePlaylist.className = 'button-create-playlist'

    const plusIcon = document.createElement('i')
    plusIcon.className = "fas fa-plus plus-icon"
    const buttonTextValue = document.createElement('div')
    buttonTextValue.id = 'new-playlist-text'
    buttonTextValue.textContent = "New Playlist"

    buttonCreatePlaylist.appendChild(plusIcon)
    buttonCreatePlaylist.appendChild(buttonTextValue)
    playlistsDisplay.appendChild(buttonCreatePlaylist)
    buttonCreatePlaylist.addEventListener('click', () => {
      animate(playlistsDisplayWrapper, 'fade-out-to-left')
      new PlaylistEditor({
        name: "",
        type: "youtube",
        videos: [
          {
            id: "",
            title: ""
          }
        ],
        playlistID: "",
        isShuffle: false
      })
      animate(playlistEditorWrapper, 'fade-in-from-right')
    })

    const buttonCloseWindow = document.createElement('i')
    buttonCloseWindow.id = 'close-window'
    buttonCloseWindow.className = 'fas fa-times-circle'
    buttonCloseWindow.addEventListener('click', () => {
      window.YoutubeRadio.close()
    })

    const buttonPinPlayer = document.createElement('i')
    buttonPinPlayer.className = 'fas fa-thumbtack'
    buttonPinPlayer.id = 'button-pin-player'
    window.YoutubeRadio.isPinned().then(tf => {
      buttonPinPlayer.style.color = tf ? "#353535" : "#909090"
    })

    buttonPinPlayer.addEventListener('click', async () => {
      const isPinned = await window.YoutubeRadio.pinPlayer()
      buttonPinPlayer.style.color = isPinned ? "#353535" : "#909090"
    })


    playlistsDisplayWrapper.appendChild(buttonCloseWindow)
    playlistsDisplayWrapper.appendChild(buttonPinPlayer)
    playlistsDisplayWrapper.append(playlistsDisplay)
  }
}


const playlistDetailDisplayWrapper = document.getElementById('playlist-detail-display-wrapper')

class PlaylistDetailDisplay {
  constructor(readonly playlist: Playlist) {
    const detailDisplay = document.createElement('div')
    detailDisplay.className = 'playlist-detail-display'
    playlistDetailDisplayWrapper.appendChild(detailDisplay)


    const buttonBack = document.createElement('i')
    buttonBack.className = 'fa-solid fa-arrow-left'
    buttonBack.id = 'button-back-to-playlist-display'

    buttonBack.addEventListener('click', async () => {
      await Promise.all([
        animate(playlistDetailDisplayWrapper, 'fade-out-to-right'),
        animate(playlistsDisplayWrapper, 'fade-in-from-left')
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
    const playlistInfoDisplay = document.createElement('div')
    playlistInfoDisplay.id = "playlist-info-display"

    const thumbnail = document.createElement('img')
    thumbnail.src = `https://img.youtube.com/vi/${playlist.videos[0].id}/sddefault.jpg`
    thumbnail.className = 'playlist-thumbnail'

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
        index: playlist.isShuffle ? getRandomInt(0, playlist.videos.length) : 0
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
      await window.YoutubeRadio.editPlaylist(playlist.name, playlist)
    })

    const buttonDelete = document.createElement('i')
    buttonDelete.className = "fa-solid fa-trash button-remove navigator"

    buttonDelete.addEventListener('click', async () => {
      await window.YoutubeRadio.deletePlaylist(playlist.name)

      reloadPlaylistsAndUI(() => {
        return Promise.all([
          animate(playlistDetailDisplayWrapper, 'fade-out-to-right'),
          animate(playlistsDisplayWrapper, 'fade-in-from-left')
        ])
      })
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

    if (playlist.type === "youtube") {
      const youtubePlaylistURLDisplay = document.createElement('div')
      youtubePlaylistURLDisplay.spellcheck = false
      youtubePlaylistURLDisplay.className = 'yt-playlist-url-display'
      youtubePlaylistURLDisplay.textContent = `youtube.com/playlist?list=${playlist.playlistID}`
      youtubePlaylistURLDisplay.addEventListener('click', () => {
        window.YoutubeRadio.openExternal(`https://youtube.com/playlist?list=${playlist.playlistID}`)
      })
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

    playlist.videos.forEach((e, index: number) => {
      const id = e.id
      const title = e.title

      if (id === "") {
        return;
      }

      const videoDisplay = document.createElement('div')
      videoDisplay.className = 'video-display'

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
    const currentPlaylistName = playlist.name
    const editPlaylist = (pl: Playlist) => {
      return window.YoutubeRadio.editPlaylist(currentPlaylistName, pl)
    }

    const playlistEditor = document.createElement('div')
    playlistEditor.id = 'playlist-editor'


    const playlistNameEditorWrapper = document.createElement('div')
    playlistNameEditorWrapper.id = 'palylist-name-editor-wrapper'
    const playlistNameEditor = document.createElement('input')

    playlistNameEditor.spellcheck = false
    playlistNameEditor.type = 'text'
    playlistNameEditor.id = 'playlist-name-editor'
    playlistNameEditor.value = playlist.name
    playlistNameEditor.placeholder = 'Playlist Name'
    playlistNameEditorWrapper.appendChild(playlistNameEditor)

    playlistNameEditorWrapper.addEventListener('click', event => {
      playlistNameEditor.focus()
    })

    const thumbnail = new Image()
    const thumbnailURL = `https://img.youtube.com/vi/${playlist.videos[0].id}/sddefault.jpg`
    thumbnail.src = thumbnailURL
    thumbnail.className = 'thumbnail-playlist-editor'


    const videoContentDisplay = document.createElement('div')
    videoContentDisplay.id = 'editor-video-content-display'


    const buttonEditPlaylist = document.createElement('i')
    buttonEditPlaylist.id = 'button-save-playlist'
    buttonEditPlaylist.className = 'fa-solid fa-floppy-disk'

    if (playlist.type === "youtube") {

      const playlistURLDisplay = document.createElement('input')
      playlistURLDisplay.placeholder = 'Playlist URL'

      videoContentDisplay.addEventListener('click', () => {
        playlistURLDisplay.select()
      })


      async function changeSaveButtonColorOfValidOrNot() {
        buttonEditPlaylist.style.color = (await isValidPlaylistName(playlistNameEditor.value, playlist.name)) && isValidYoutubePlaylistUrl(playlistURLDisplay.value) ? '#353535' : '#a7a7a7'
      }

      playlistURLDisplay.addEventListener('input', () => {
        changeSaveButtonColorOfValidOrNot()
      })
      playlistNameEditor.addEventListener('input', async () => {
        changeSaveButtonColorOfValidOrNot()
      })

      playlistURLDisplay.className = 'playlist-url-input'
      playlistURLDisplay.type = 'text'
      playlistURLDisplay.value = `https://www.youtube.com/playlist?list=${playlist.playlistID}`

      buttonEditPlaylist.addEventListener('click', async () => {

        playlist.name = playlistNameEditor.value
        playlist.playlistID = (window.YoutubeRadio.parse(playlistURLDisplay.value, true).query as any).list

        if (isValidYoutubePlaylistUrl(playlistURLDisplay.value) && await isValidYoutubePlaylistUrl(playlistURLDisplay.value)) {
          console.log(playlist);

          await editPlaylist(playlist)
          reloadPlaylistsAndUI(() => {
            return Promise.all([
              animate(playlistEditorWrapper, 'fade-out-to-right'),
              animate(playlistsDisplayWrapper, 'fade-in-from-left')
            ])
          })
        }
      })

      videoContentDisplay.appendChild(playlistURLDisplay)
    } else if (playlist.type === "youtube_radio") {

      async function changeSaveButtonColorOfValidOrNot() {
        buttonEditPlaylist.style.color = await isValidPlaylistName(playlistNameEditor.value, playlist.name) ? '#353535' : '#a7a7a7'
      }

      playlistNameEditor.addEventListener('input', () => {
        changeSaveButtonColorOfValidOrNot()
      })

      const videoURLs: HTMLInputElement[] = []


      playlist.videos.forEach((video: YoutubeVideo, index: number) => {
        const videoDisplay = document.createElement('div')
        videoDisplay.className = 'editor-video-display'

        const buttonRemoveVideo = document.createElement('i')
        buttonRemoveVideo.className = 'fas fa-times button-remove-video'

        buttonRemoveVideo.addEventListener('click', async () => {
          await animate(videoDisplay, 'fade-away')
          videoDisplay.remove()
          playlist.videos.splice(index, 1)
        })

        const displayTitleAndURL = new PlaylistEditor.DisplayURLAndTitle(video.id, video.title)

        videoURLs.push(displayTitleAndURL.url)

        videoDisplay.appendChild(buttonRemoveVideo)
        videoDisplay.appendChild(displayTitleAndURL.title)
        videoDisplay.appendChild(displayTitleAndURL.url)

        buttonRemoveVideo.addEventListener('click', async () => {
          await animate(videoDisplay, 'fade-away')
          videoDisplay.remove()
          videoURLs.splice(index, 1)
        })

        videoContentDisplay.appendChild(videoDisplay)
      })


      buttonEditPlaylist.addEventListener('click', async () => {
        playlist.name = playlistNameEditor.value
        if (await isValidPlaylistName(playlist.name, playlist.name)) {
          const videos = parseVideoURLs(videoURLs)

          await editPlaylist({
            name: playlist.name,
            isShuffle: playlist.isShuffle,
            videos: videos,
            type: playlist.type,
          })
          reloadPlaylistsAndUI(() => {
            return Promise.all([
              animate(playlistEditorWrapper, 'fade-out-to-right'),
              animate(playlistsDisplayWrapper, 'fade-in-from-left')
            ])
          })
        }
      })


      const buttonAddVideo = document.createElement('i')
      buttonAddVideo.id = 'button-add-video'
      buttonAddVideo.className = 'fas fa-plus-circle'

      buttonAddVideo.addEventListener('click', () => {
        const index = videoURLs.length - 1
        const videoDisplay = document.createElement('div')

        const buttonRemoveVideo = document.createElement('i')
        buttonRemoveVideo.className = 'fas fa-times button-remove-video'


        videoDisplay.appendChild(buttonRemoveVideo)

        videoDisplay.className = 'editor-video-display'

        const displayURLAndTitle = new PlaylistEditor.DisplayURLAndTitle("", "")

        videoURLs.push(displayURLAndTitle.url)


        buttonRemoveVideo.addEventListener('click', async () => {
          await animate(videoDisplay, 'fade-away')
          videoDisplay.remove()
          videoURLs.splice(index, 1)
        })

        displayURLAndTitle.title.style.display = 'none'
        displayURLAndTitle.url.style.display = 'flex'
        displayURLAndTitle.url.placeholder = 'Youtube URL'
        videoDisplay.appendChild(displayURLAndTitle.url)
        videoDisplay.appendChild(displayURLAndTitle.title)
        displayURLAndTitle.url.focus()
        buttonAddVideo.before(videoDisplay)
        videoContentDisplay.scrollTo(0, videoDisplay.offsetTop)
        displayURLAndTitle.url.focus()

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
    playlistEditor.appendChild(buttonEditPlaylist)
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
          videoUrlDisplay.readOnly = title === "" ? false : true
          if (title !== "") {
            videoTitleDisplay.value = title
            videoTitleDisplay.style.display = 'flex'
            videoUrlDisplay.style.display = 'none'

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
          }
        }

      })

      videoTitleDisplay.addEventListener('focus', (event) => {
        event.stopPropagation()
        videoTitleDisplay.style.display = 'none'
        videoUrlDisplay.style.display = 'flex'
        videoUrlDisplay.focus()
      })

      videoUrlDisplay.addEventListener('focusout', async (event) => {
        if (videoTitleDisplay.value !== "") {
          event.stopPropagation()
          videoUrlDisplay.style.display = 'none'
          videoTitleDisplay.style.display = 'flex'
        }
      })


      this.title = videoTitleDisplay
      this.url = videoUrlDisplay
    }
    url: HTMLInputElement
    title: HTMLInputElement

  }
}
