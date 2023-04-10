import * as React from "react";
import { Playlist, YoutubeVideo } from "../../lib/config";
import { YoutubeRadioPreload } from "../../preload/playlist";
import { ContextAppState, ContextDispatchAppState } from "./main";
import { ReducerActions } from "./reducer";


interface preload extends Window {
  YoutubeRadio: YoutubeRadioPreload
}
export declare const window: preload


const Icons = {
  pin: "fas fa-thumbtack",
  play: "fas fa-play",
  arrowLeft: "fa-solid fa-arrow-left",
  note: "fa-solid fa-music",
  shuffle: "fa-solid fa-shuffle",
  pencil: "fa-solid fa-pencil",
  trashBin: "fa-solid fa-trash",
  save: "fa-solid fa-floppy-disk",
  close: "fas fa-times-circle",
  cross: "fas fa-times",
  plusCircle: "fas fa-plus-circle"

}

export const PlaylistDisplay: React.FC<{ playlist: Playlist, index: number }> = (props) => {
  const playlistThumbnailSrc = getYoutubeThumbnailURLFromID((props.playlist.videos[0] ?? { id: '' }).id)
  const dispatch = React.useContext(ContextDispatchAppState)
  return (
    <div className="playlist-display">
      <Thumbnail src={playlistThumbnailSrc} className="thumbnail"></Thumbnail>
      <div
        className="playlist-title-display"
        onClick={() => {
          pushDisplayWithAnimation(dispatch, 'playlist-detail')
          dispatch({
            type: 'set-target-playlist',
            props: props.playlist
          })
        }}>
        {props.playlist.name}
      </div>
      <IconedButton
        iconName="play"
        className="play-button"
        onClick={() => {
          dispatch({
            type: 'navigate-playlist',
            props: {
              name: props.playlist.name,
              index: 0,
              shuffle: props.playlist.isShuffle
            }
          })
          dispatch({
            type: 'close-window'
          })
        }} />
    </div >
  )
}

export const PlaylistsDisplay: React.FC<{ index: number }> = (props) => {
  const appState = React.useContext(ContextAppState)
  const dispatch = React.useContext(ContextDispatchAppState)
  return (
    <div id="playlist-display-wrapper" className={appState.switchAnimationHook[props.index]} style={{
      pointerEvents: appState.isAnimating ? 'none' : 'auto'
    }}>
      <div id="playlists-display">
        {appState.playlists.map(playlist => <PlaylistDisplay playlist={playlist} index={props.index} />)}
        <ButtonCreatePlaylist />
      </div>
      <IconedButton
        iconName="close"
        id="close-window"
        onClick={() => {
          window.YoutubeRadio.close()
        }} />
      <ButtonPinPlayer />
    </div>
  )
}

export const PlaylistDetailDisplay: React.FC<{ index: number }> = (props) => {
  const appState = React.useContext(ContextAppState)
  const dispatch = React.useContext(ContextDispatchAppState)
  return (
    <div id="playlist-detail-display-wrapper" className={appState.switchAnimationHook[props.index]} style={{
      pointerEvents: appState.isAnimating ? 'none' : 'auto'
    }}>
      <div className="playlist-detail-display">
        <IconedButton
          iconName="arrowLeft"
          id="button-back-to-playlist-display"
          onClick={() => {
            popDisplayWithAnimation(dispatch)
          }} />
        <PlaylistInformationDisplay playlist={appState.targetPlaylist} />
        <VideoListDisplay playlist={appState.targetPlaylist} />
      </div>
    </div>
  )
}


export const PlaylistEditorDisplay: React.FC<{ index: number }> = (prop) => {
  const appState = React.useContext(ContextAppState)
  const dispatch = React.useContext(ContextDispatchAppState)

  const [playlistEdit, setPlaylistEdit] = React.useState(appState.targetPlaylist)

  const refNameInput = React.useRef<HTMLInputElement>()
  const refURLInput = React.useRef<HTMLInputElement>()

  let videoEditor: string | number | boolean | JSX.Element | React.ReactFragment;

  if (playlistEdit.type === 'youtube') {
    videoEditor = <EditableTextInput
      value={`www.youtube.com/playlist?list=${playlistEdit.playlistID}`}
      className='playlist-url-input'
      spellCheck={false}
      onChange={(event) => {
        setPlaylistEdit({
          ...playlistEdit,
          playlistID: parsePlaylistURL(event.target.value).id
        })
      }}
    />
  } else if (playlistEdit.type === 'youtube_radio') {
    videoEditor = <>
      {playlistEdit.videos.map((video, index) => (
        <EditableVideoDisplay video={video} index={index} onDelete={(_, index) => {
          playlistEdit.videos.splice(index, 1)
          setPlaylistEdit({
            ...playlistEdit
          })
        }} />
      ))}
      {<IconedButton iconName="plusCircle" id="button-add-video" onClick={() => {
        setPlaylistEdit({
          ...playlistEdit,
          videos: [...playlistEdit.videos, { id: "", title: "" }]
        })
      }} />}
    </>
  }

  return (
    <div id="playlist-editor-wrapper" className={appState.switchAnimationHook[prop.index]} style={{
      pointerEvents: appState.isAnimating ? 'none' : 'auto'
    }}>
      <div id="playlist-editor">
        <IconedButton iconName="arrowLeft" id="button-back-to-playlist-detail" onClick={() => {
          popDisplayWithAnimation(dispatch)
        }} />
        <img src={getYoutubeThumbnailURLFromID((appState.targetPlaylist.videos[0] ?? { id: '' }).id)} className="thumbnail-playlist-editor"></img>
        <div id="palylist-name-editor-wrapper">
          <EditableTextInput
            spellCheck={false}
            id='playlist-name-editor'
            placeholder="Playlist Name"
            value={appState.targetPlaylist.name}
            onChange={event => {
              setPlaylistEdit({
                ...playlistEdit,
                name: event.target.value
              })
            }}
            ref={refNameInput}
          />
        </div>
        <div id="editor-video-content-display">
          {videoEditor}
        </div>
        <ButtonSavePlaylist playlist={playlistEdit} />
      </div>
    </div >
  )
}

export const FallBack: React.FC = () => {
  const appState = React.useContext(ContextAppState)
  return (
    <div id="playlist-display-wrapper">
      <div id="playlists-display">
        {appState.playlists.map(() => <div className='playlist-display' style={{
          backgroundColor: ''
        }}></div>)}
        <ButtonCreatePlaylist />
      </div>
      <IconedButton iconName="close" id="close-window" />
      <ButtonPinPlayer />
    </div>
  )
}

const ButtonCreatePlaylist: React.FC = () => {
  const dispatch = React.useContext(ContextDispatchAppState)

  return (
    <div className='button-create-playlist' onClick={() => {
      dispatch({
        type: 'set-target-playlist',
        props: {
          name: '',
          videos: [],
          type: 'youtube',
          isShuffle: false
        }
      })
      pushDisplayWithAnimation(dispatch, 'playlist-editor')
    }}>
      <i className='fas fa-plus plus-icon'></i>
      <div id="new-playlist-text">Create Playlist</div>
    </div>
  )
}

const IconedButton: React.FC<{ iconName: keyof typeof Icons } & React.HtmlHTMLAttributes<HTMLElement>> = (props) => {
  const className = props.className + ` ${Icons[props.iconName]}`
  return <i  {...props} className={className}></i >
}

const ButtonPinPlayer: React.FC = () => {
  const [isPinned, setIsPinned] = React.useState<boolean>(false)
  React.useEffect(() => {
    (async () => {
      const isPinned = await window.YoutubeRadio.isPinned()
      setIsPinned(isPinned)
    })()
  })
  return (
    <IconedButton
      iconName="pin"
      id="button-pin-player"

      onClick={async () => {
        const isPinned = await window.YoutubeRadio.pinPlayer()
        setIsPinned(isPinned)
      }}

      style={{
        color: isPinned ? "#353535" : "#909090"
      }}
    />
  )
}

const Thumbnail: React.FC<{ src: string, className: string }> = (props) => {
  return <img src={props.src} className={props.className}></img>
}


const ButtonShuffle: React.FC<{ playlist: Playlist }> = (props) => {
  const dispatch = React.useContext(ContextDispatchAppState)
  return (
    <IconedButton
      iconName="shuffle"
      onClick={() => {
        dispatch({
          type: 'edit-target-playlist',
          props: {
            ...props.playlist,
            isShuffle: !props.playlist.isShuffle
          }
        })
      }}
      style={
        {
          color: props.playlist.isShuffle ? '#353535' : '#A6A6A6'
        }
      }
      className="button-shuffle navigator"
    />
  )
}



const PlaylistNavigator: React.FC<{ playlist: Playlist }> = (props) => {
  const dispatch = React.useContext(ContextDispatchAppState)

  const buttonPlay =
    <IconedButton
      iconName="play"
      className="button-play navigator"
      onClick={() => {
        window.YoutubeRadio.navigatePlaylist({
          name: props.playlist.name,
          shuffle: props.playlist.isShuffle,
          index: props.playlist.isShuffle ? getRandomInt(0, props.playlist.videos.length) : 0
        })
        window.YoutubeRadio.close()
      }}
    />
  const buttonSuffle = <ButtonShuffle playlist={props.playlist} />
  const buttonDelete =
    <IconedButton
      iconName="trashBin"
      className="button-remove navigator"
      onClick={() => {
        dispatch({
          type: 'delete-playlist',
          props: props.playlist.name
        })
        popDisplayWithAnimation(dispatch)
      }}
    />
  const buttonEdit = <IconedButton
    iconName="pencil"
    className="button-edit"
    onClick={() => {
      pushDisplayWithAnimation(dispatch, 'playlist-editor')
    }}
  />
  const playlistURLDisplay = <div spellCheck={false} className="yt-playlist-url-display"
    onClick={() => {
      window.YoutubeRadio.openExternal(getPlaylistURLFromPlaylistID(props.playlist.playlistID))
    }}>
    {`www.youtube.com/playlist?list=${props.playlist.playlistID}`}
  </div>
  return (
    <div id="playlist-navigator">
      {[buttonPlay, buttonSuffle, buttonDelete, buttonEdit, (props.playlist.type === 'youtube' ? playlistURLDisplay : null)]}
    </div>
  )
}

const PlaylistNameDisplay: React.FC<{ name: string }> = (props) => {
  return (
    <div id="playlist-name-display-wrapper">
      <div spellCheck={false} id="playlist-title-display">{props.name}</div>
    </div>
  )
}

const NameDisplayAndNavigator: React.FC<{ playlist: Playlist }> = (props) => {
  return (
    <div id="name-display-and-navigator">
      <PlaylistNameDisplay name={props.playlist.name} />
      <PlaylistNavigator playlist={props.playlist} />
    </div>
  )
}

const PlaylistInformationDisplay: React.FC<{ playlist: Playlist }> = (props) => {
  return (
    <div id="playlist-info-display">
      <img src={getYoutubeThumbnailURLFromID(props.playlist.videos[0].id)} className="playlist-thumbnail"></img>
      <NameDisplayAndNavigator playlist={props.playlist} />
    </div>
  )
}

const VideoDisplay: React.FC<{
  video: YoutubeVideo,
  videoIndex: number,
  playlist: Playlist
}> = (props) => {
  return (
    <div className="video-display">
      <IconedButton iconName="note" className="icon-music" />
      <CharterDisplay value={props.video.title} />
      <IconedButton iconName="play" className="button-playvideo" onClick={() => {
        window.YoutubeRadio.navigatePlaylist({
          name: props.playlist.name,
          index: props.videoIndex,
          shuffle: props.playlist.isShuffle
        })
        window.YoutubeRadio.close()
      }} />
    </div>
  )
}

const VideoListDisplay: React.FC<{ playlist: Playlist }> = (props) => {
  return (
    <div className="videolist-display">
      {
        props.playlist.videos.map((video, index) => (<VideoDisplay video={video} videoIndex={index} playlist={props.playlist} />))
      }
    </div>
  )
}

const CharterDisplay: React.FC<{ value: string }> = (props) => {
  return (
    <input
      value={props.value}
      spellCheck="false"
      className="video-title-display charter-display"
      type="text"
      style={
        {
          pointerEvents: "none"
        }
      } />
  )
}

const EditableTextInput: React.FC<Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, 'type'>> = (props) => {

  const [stateValue, setStateValue] = React.useState(props.value)
  const handler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if ((typeof props.onChange) === "function" && props.onChange) {

      props.onChange(event)
    }
    setStateValue(event.target.value)
  }
  return <input {...props} type="text" value={stateValue} onChange={handler}></input>
}




const EditableVideoDisplay: React.FC<{ video: YoutubeVideo, index: number, onDelete?: (video: YoutubeVideo, index: number) => void }> = (props) => {
  const [currentDisplay, setCurrentDisplay] = React.useState<'title' | 'url'>('title')
  const isDefault = props.video.id === ''
  if (isDefault && currentDisplay === 'title') {
    setCurrentDisplay('url')
  }

  const [isDeleted, setIsDeleted] = React.useState<boolean>(false)
  const [animationHook, setAnimationHook] = React.useState<'' | 'fade-away'>('')
  const [title, setTitle] = React.useState(props.video.title)
  const [id, setID] = React.useState(props.video.id)

  const refInputURL = React.useRef<HTMLInputElement>()
  const url = isDefault ? '' : `youtube.com/watch?v=${id}`
  React.useEffect(() => {
    refInputURL.current.focus()
  }, [currentDisplay])

  if (isDeleted) {
    return <></>
  }

  return (
    <div className={`editor-video-display ${animationHook}`} >
      <IconedButton iconName="cross" className='button-remove-video' onClick={async () => {
        setAnimationHook('fade-away')
        await sleep(300)
        setIsDeleted(true)
        typeof props.onDelete === 'function' ? props.onDelete(props.video, props.index) : {}
      }} />
      <input type='text' value={title} className='charter-display' readOnly={true}
        onClick={() => {
          refInputURL.current.focus()
          setCurrentDisplay('url')
        }}
        style={{
          display: currentDisplay === 'title' ? 'flex' : 'none'
        }} />
      <input type='text' placeholder="Youtube URL" defaultValue={url} className='charter-display' ref={refInputURL} readOnly={!isDefault}
        onBlur={() => {
          setCurrentDisplay('title')
        }}
        style={{
          display: currentDisplay === 'url' ? 'flex' : 'none'
        }} />
    </div >
  )
}

function logThrough<T>(p: T): T {
  console.log(p)
  return p
}

const ButtonSavePlaylist: React.FC<{ playlist: Playlist }> = (props) => {
  const appState = React.useContext(ContextAppState)
  const dispatch = React.useContext(ContextDispatchAppState)

  const isValidPlaylistName = new MultipileConditions()
  const isValidPlaylistURL = new MultipileConditions()
  const isValidVideos = new MultipileConditions()

  const parsedPlaylistURL = parsePlaylistURL(getPlaylistURLFromPlaylistID(props.playlist.playlistID))

  isValidPlaylistName
    .add(props.playlist.name.length > 0)
    .add(!appState.playlists.map(pl => pl.name).includes(props.playlist.name), props.playlist.name !== appState.targetPlaylist.name)


  isValidPlaylistURL
    .add(parsedPlaylistURL.host === 'www.youtube.com')
    .add(parsedPlaylistURL.id.length === 34)
    .add(parsedPlaylistURL.protocol === 'https:')


  isValidVideos.
    add(props.playlist.videos
      .map(v => parseYoutubeVideoURL(getYoutubeURLFromID(v.id)))
      .map(p => (p.host === 'www.youtube.com' && p.id.length === 11 && p.protocol === 'https:'))
      .reduce((c, p) => c && p, true)
    )

  let isValidEdit = false;

  if (props.playlist.type === 'youtube') {
    isValidEdit = isValidPlaylistName.reduce() && isValidPlaylistURL.reduce()
  } else if (props.playlist.type === 'youtube_radio') {
    isValidEdit = isValidPlaylistName.reduce() && isValidVideos.reduce()
  }


  return (
    <IconedButton iconName="save" id="button-save-playlist"
      style={{
        color: isValidEdit ? '#353535' : '#A6A6A6'
      }}
      onClick={() => {
        if (isValidEdit) {
          dispatch({
            type: 'edit-target-playlist',
            props: props.playlist
          })
          reloadPlaylistsWithAnimation(dispatch)
        }
      }} />

  )
}

type VideoURL = {
  protocol: string
  id: string
  host: string
}

function parseYoutubeVideoURL(url: string): VideoURL {
  const parsedURL = window.YoutubeRadio.parse(url, true)
  return {
    protocol: parsedURL.protocol ?? '',
    id: (parsedURL.query as { v: string }).v ?? '',
    host: parsedURL.hostname ?? ''
  }
}


type PlaylistURL = {
  protocol: string
  id: string
  host: string
}

function parsePlaylistURL(url: string): PlaylistURL {
  const reIncludesHttps = /^https:\/\//;
  url = reIncludesHttps.test(url) ? url : `https://${url}`

  const parsedURL = window.YoutubeRadio.parse(url, true)
  return {
    protocol: parsedURL.protocol ?? '',
    id: (parsedURL.query as { list: string }).list ?? '',
    host: parsedURL.hostname ?? ''
  }
}

async function popDisplayWithAnimation(dispatch: (ReducerAction: ReducerActions[keyof ReducerActions]) => void) {
  dispatch({
    type: 'animate',
    props: 'pop'
  })
  await sleep(700)
  dispatch({
    type: 'pop-display'
  })
  dispatch({
    type: 'animation-end'
  })
}

async function pushDisplayWithAnimation(dispatch: (ReducerAction: ReducerActions[keyof ReducerActions]) => void, displayName: ReducerActions['push-display']['props']) {
  dispatch({
    type: 'push-display',
    props: displayName
  })
  dispatch({
    type: 'animate',
    props: 'push'
  })
  await sleep(700)
  dispatch({
    type: 'animation-end'
  })
}

async function reloadPlaylistsWithAnimation(dispatch: (ReducerAction: ReducerActions[keyof ReducerActions]) => void) {
  dispatch({
    type: 'animate',
    props: 'reload'
  })
  await sleep(700)
  dispatch({
    type: 'animation-end'
  })
  dispatch({
    type: 'reload-playlists'
  })

}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function getYoutubeThumbnailURLFromID(videoID: string): string {
  return `https://img.youtube.com/vi/${videoID ?? ''}/sddefault.jpg`
}

function getPlaylistURLFromPlaylistID(id: string): string {
  return `https://www.youtube.com/watch?list=${id}`
}

function getYoutubeURLFromID(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`
}

function sleep(time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, time);
  });
}


function htmlspecialchars(str: string) {
  return (str + '').replace(/&amp;/g, "&")
    .replace(/&quot;/g, '\"')
    .replace(/&#39;/g, '\'')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

class MultipileConditions {
  constructor(...conditions: boolean[]) {
    this.conditions = [...conditions]
  }
  add(condition: boolean, option: boolean = true): MultipileConditions {
    if (option) {
      this.conditions.push(condition)
    }
    return this
  }
  reduce(): boolean {
    return this.conditions.reduce((p, c) => p && c, true)
  }
  private conditions: boolean[]

}
