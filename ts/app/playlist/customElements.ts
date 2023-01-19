import { Playlist, playlistTypes, YoutubeVideo } from "../../lib/config/main";
import { YoutubeRadioPreload } from "../../preload/playlist/preload";

interface preload extends Window {
  YoutubeRadio: YoutubeRadioPreload
}

interface HTMLCustomElementTanName extends HTMLElementTagNameMap {
  "thmubnail": thumbnail;
}

function createChild<K extends keyof HTMLCustomElementTanName>(parent: HTMLElement, tagName: K): HTMLCustomElementTanName[K] {
  const child: any = document.createElement(tagName)
  parent.appendChild(child)
  return child
}


class PlaylistDisplay extends HTMLElement {
  constructor(playlist: Playlist) {
    super()
    Object.assign(this, playlist)
    this.className = 'playlist-display'

    this.thmubNail = createChild(this, 'thmubnail')
    this.nameDisplay = createChild(this, 'div')
  }
  set name(name: string) {

  }

  private nameDisplay: HTMLElement
  private thmubNail: thumbnail
  private playButton: Button
}

window.customElements.define('playlist-display', PlaylistDisplay)

class thumbnail extends HTMLImageElement {
  constructor(src: string) {
    super()
    this.src = src
    this.className = 'thumbnail'
  }
}

window.customElements.define('thumbnail', thumbnail)

class PlaylistDetailDisplay extends HTMLElement implements Playlist {
  constructor(pl: Playlist) {
    super()
    Object.assign(this, pl)

    this.nameDisplay = createChild(this, 'div')
  }
  set name(name: string) { }
  set videos(videos: YoutubeVideoDisplay[]) {

  }
  type!: playlistTypes
  isShuffle!: boolean
  set playlistID(name: string) { }

  private nameDisplay: HTMLElement
  private navigators: Button[]
}

window.customElements.define('playlist-detail-display', PlaylistDetailDisplay)


interface Editor {
  editName(newName: string): Promise<void>
  editVideos(newVideos: string): Promise<void>
  editURL?(newURL: string): Promise<void>
}

class YoutubePlaylistEditor extends HTMLElement implements Editor, Playlist {
  constructor(pl: Playlist) {
    super()
    Object.assign(this, pl)
  }

  editName(newName: string): Promise<void> {
    return
  }
  editVideos(newVideos: string): Promise<void> {
    return
  }
  editURL(newURL: string): Promise<void> {
    return
  }

  name!: string;
  videos!: YoutubeVideo[]
  type!: playlistTypes
  isShuffle!: boolean
  playlistID?: string
}

window.customElements.define('youtube-playlist-editor', YoutubePlaylistEditor)


class YoutubeRadioPlaylistEditor extends HTMLElement implements Editor, Playlist {
  constructor(pl: Playlist) {
    super()
    Object.assign(this, pl)
  }

  editName(newName: string): Promise<void> {
    return
  }
  editVideos(newVideos: string): Promise<void> {
    return
  }
  editURL(newURL: string): Promise<void> {
    return
  }

  name!: string
  videos!: YoutubeVideo[]
  type!: playlistTypes
  isShuffle!: boolean
  playlistID?: string
}

window.customElements.define('youtube-radio-playlist-editor', YoutubeRadioPlaylistEditor)

class YoutubeVideoDisplay extends HTMLElement implements YoutubeVideo {
  constructor(video: YoutubeVideo) {
    super()
    Object.assign(this, video)
  }
  set id(id: string) {

  }
  readonly title: string

}

window.customElements.define('youtube-video-display', YoutubeVideoDisplay)

class Button extends HTMLElement {
  constructor(callback: (...any) => any) {
    super()
    this.classList.add('button')
    this.addEventListener('click', callback)
  }
}

window.customElements.define('button', Button)
