import * as React from "react";
import { Playlist, YoutubePlaylist, YoutubeVideo } from "../../lib/config";
import { YoutubeRadioPreload, playlistNavigation } from "../../preload/playlist";
import { ContextAppState, ContextDispatchAppState } from "./main";
import { ReducerActions } from "./reducer";
import { ForwardedRef } from "react";


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
  plusCircle: "fas fa-plus-circle",
  iconYoutube: "fa-brands fa-youtube"
}

const Wrapper: React.FC<{ wrapTarget: 'playlist-display-wrapper' | 'playlist-detail-display-wrapper' | 'playlist-editor-wrapper' | 'playlist-type-selection-wrapper', index: number, children: React.ReactNode[] | React.ReactNode }> = (props) => {
  const appState = React.useContext(ContextAppState)
  return <div id={props.wrapTarget} className={`${appState.switchAnimationHook[props.index]}`} style={{ pointerEvents: appState.isAnimating ? 'none' : 'auto' }}>{props.children}</div>
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
          loadPlaylist(props.playlist.name)
          navigatePlaylist({
            shuffle: props.playlist.isShuffle
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
    <Wrapper wrapTarget='playlist-display-wrapper' index={props.index}>
      <div id="playlists-display">
        {appState.playlists.map(playlist => <PlaylistDisplay playlist={playlist} index={props.index} />)}
        <ButtonCreatePlaylist />
      </div>
      <IconedButton
        iconName="close"
        id="close-window"
        onClick={() => {
          dispatch({
            type: 'close-window'
          })
        }} />
      <ButtonPinPlayer />
    </Wrapper>
  )
}

export const PlaylistDetailDisplay: React.FC<{ index: number }> = (props) => {
  const appState = React.useContext(ContextAppState)
  const dispatch = React.useContext(ContextDispatchAppState)
  return (
    <Wrapper wrapTarget='playlist-detail-display-wrapper' index={props.index}>
      <div className="playlist-detail-display">
        <IconedButton
          iconName="arrowLeft"
          className="button-back"
          onClick={() => {
            popDisplayWithAnimation(dispatch)
          }} />
        <PlaylistInformationDisplay playlist={appState.targetPlaylist} />
        <VideoListDisplay playlist={appState.targetPlaylist} />
      </div>
    </Wrapper>
  )
}


export const PlaylistEditorDisplay: React.FC<{ index: number }> = (props) => {
  const appState = React.useContext(ContextAppState)
  const dispatch = React.useContext(ContextDispatchAppState)

  const [playlistEdit, setPlaylistEdit] = React.useState(appState.targetPlaylist)
  const refNameInput = React.useRef<HTMLInputElement>()
  const refURLInput = React.useRef<HTMLInputElement>()


  let videoEditor: string | number | boolean | JSX.Element | React.ReactFragment

  if (playlistEdit.type === 'youtube') {
    const playlistURL = playlistEdit.playlistID ? `www.youtube.com/playlist?list=${playlistEdit.playlistID} ` : ''
    videoEditor = <input
      type="text"
      placeholder="Youtube Playlist URL"
      defaultValue={playlistURL}
      className='playlist-url-input'
      spellCheck={false}
      ref={refURLInput}
      onClick={() => {
        refURLInput.current.select()
      }}
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
        <EditableVideoDisplay video={video} index={index}
          setEditedVideo={(video: YoutubeVideo | 'delete') => {
            if (video === 'delete') {
              playlistEdit.videos.splice(index, 1)
              setPlaylistEdit({
                ...playlistEdit
              })
            } else {
              playlistEdit.videos[index] = video
              setPlaylistEdit({
                ...playlistEdit
              })
            }
          }}
        />

      ))}
      {playlistEdit.videos.length < 100 ? <IconedButton iconName="plusCircle" id="button-add-video" onClick={() => {
        setPlaylistEdit({
          ...playlistEdit,
          videos: [...playlistEdit.videos, { id: "", title: "" }]
        })
      }} /> : <></>}
    </>
  }

  return (
    <Wrapper wrapTarget="playlist-editor-wrapper" index={props.index}>
      <div id="playlist-editor">
        <IconedButton iconName="arrowLeft" className="button-back" onClick={() => {
          popDisplayWithAnimation(dispatch)
        }} />
        <Thumbnail src={getYoutubeThumbnailURLFromID((appState.targetPlaylist.videos[0] ?? { id: '' }).id)} className="thumbnail-playlist-editor" style={{ background: "aqua" }} />
        <div id="palylist-name-editor-wrapper">
          <input
            type="text"
            spellCheck={false}
            id='playlist-name-editor'
            placeholder="Playlist Name"
            defaultValue={appState.targetPlaylist.name}
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
        <ButtonSavePlaylist playlistEdited={playlistEdit} />
      </div>
    </Wrapper>
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

export const PlaylistTypeSelection: React.FC<{ index: number }> = (props) => {
  const dispatch = React.useContext(ContextDispatchAppState)

  function pushEditorWithAnimation(plType: YoutubePlaylist['type']) {
    const videos: YoutubePlaylist['videos'] = plType === 'youtube' ? [] : [{ id: "", title: "" }]
    dispatch({
      type: 'set-target-playlist',
      props: {
        name: '',
        type: plType,
        videos: videos,
        isShuffle: false
      }
    })
    pushDisplayWithAnimation(dispatch, 'playlist-editor')
  }

  return (
    <Wrapper wrapTarget="playlist-type-selection-wrapper" index={props.index}>
      <div id="selection-and-description">
        <div id="label-selection-description">タイプを選択</div>
        <div id="selections">
          <div className="selection" onClick={() => {
            pushEditorWithAnimation('youtube_radio')
          }}>
            <img src="./youtube_radio.svg" id="icon-youtube-radio"></img>
          </div>
          <div className="selection" onClick={() => {
            pushEditorWithAnimation('youtube')
          }}>
            <IconedButton iconName="iconYoutube" id="iconYoutube" />
          </div>
        </div>
      </div>
      <IconedButton iconName="arrowLeft" className="button-back" onClick={() => {
        popDisplayWithAnimation(dispatch)
      }} />
    </Wrapper>
  )
}

const ButtonCreatePlaylist: React.FC = () => {
  const dispatch = React.useContext(ContextDispatchAppState)

  return (
    <div className='button-create-playlist' onClick={() => {
      pushDisplayWithAnimation(dispatch, 'playlist-type-selection')
    }}>
      <i className='fas fa-plus plus-icon'></i>
      <div id="new-playlist-text">Create Playlist</div>
    </div>
  )
}

const IconedButton: React.FC<{ iconName: keyof typeof Icons } & React.HtmlHTMLAttributes<HTMLElement>> = (props) => {
  const className = props.className + ` ${Icons[props.iconName]} `
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

const Thumbnail: React.FC<JSX.IntrinsicElements['img']> = (props) => {
  return <img {...props} style={{
    background: "#FFFFFF"
  }}></img>
}


const ButtonShuffle: React.FC = () => {
  const dispatch = React.useContext(ContextDispatchAppState)
  const appState = React.useContext(ContextAppState)

  return (
    <IconedButton
      iconName="shuffle"
      onClick={() => {
        dispatch({
          type: 'edit-target-playlist',
          props: {
            playlist: {
              ...appState.targetPlaylist,
              isShuffle: !appState.targetPlaylist.isShuffle
            }
          }
        })
        window.YoutubeRadio.editPlaylist(appState.targetPlaylist.name, {
          ...appState.targetPlaylist,
          isShuffle: !appState.targetPlaylist.isShuffle
        })
        navigatePlaylist({
          shuffle: !appState.targetPlaylist.isShuffle

        })
      }}
      style={
        {
          color: appState.targetPlaylist.isShuffle ? '#353535' : '#A6A6A6'
        }
      }
      className="button-shuffle navigator"
    />
  )
}

const PlaylistNavigator: React.FC = () => {
  const dispatch = React.useContext(ContextDispatchAppState)
  const appState = React.useContext(ContextAppState)

  const buttonPlay =
    <IconedButton
      iconName="play"
      className="button-play navigator"
      onClick={() => {
        loadPlaylist(appState.targetPlaylist.name)
        navigatePlaylist({
          shuffle: appState.targetPlaylist.isShuffle,
        })
        window.YoutubeRadio.close()
      }}
    />
  const buttonSuffle = <ButtonShuffle />
  const buttonDelete =
    <IconedButton
      iconName="trashBin"
      className="button-remove navigator"
      onClick={() => {
        dispatch({
          type: 'delete-playlist',
          props: appState.targetPlaylist.name
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
      window.YoutubeRadio.openExternal(getPlaylistURLFromPlaylistID(appState.targetPlaylist.playlistID))
    }}>
    {`www.youtube.com/playlist?list=${appState.targetPlaylist.playlistID}`}
  </div>
  return (
    <div id="playlist-navigator">
      {[buttonPlay, buttonSuffle, buttonDelete, buttonEdit, (appState.targetPlaylist.type === 'youtube' ? playlistURLDisplay : <></>)]}
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

const NameDisplayAndNavigator: React.FC = () => {
  const appState = React.useContext(ContextAppState)
  return (
    <div id="name-display-and-navigator">
      <PlaylistNameDisplay name={appState.targetPlaylist.name} />
      <PlaylistNavigator />
    </div>
  )
}

const PlaylistInformationDisplay: React.FC<{ playlist: Playlist }> = (props) => {
  const appState = React.useContext(ContextAppState)
  return (
    <div id="playlist-info-display">
      <Thumbnail src={getYoutubeThumbnailURLFromID(appState.targetPlaylist.videos[0].id)} className="playlist-thumbnail" />
      <NameDisplayAndNavigator />
    </div>
  )
}

const VideoDisplay: React.FC<{
  video: YoutubeVideo,
  videoIndex: number,
  playlist: Playlist
}> = (props) => {
  const appstate = React.useContext(ContextAppState)
  return (
    <div className="video-display">
      <IconedButton iconName="note" className="icon-music" />
      <CharterDisplay value={props.video.title} />
      <IconedButton iconName="play" className="button-playvideo" onClick={() => {
        loadPlaylist(appstate.targetPlaylist.name, props.videoIndex)
        navigatePlaylist({
          shuffle: appstate.targetPlaylist.isShuffle
        })
        window.YoutubeRadio.close()
      }} />
    </div>
  )
}

const VideoListDisplay: React.FC<{ playlist: Playlist }> = (props) => {
  const appState = React.useContext(ContextAppState)
  return (
    <div className="videolist-display">
      {
        appState.targetPlaylist.videos.map((video, index) => (<VideoDisplay video={video} videoIndex={index} playlist={props.playlist} />))
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

type EditableVideoDisplayPropType = { video: YoutubeVideo, index: number, setEditedVideo: (option: YoutubeVideo | 'delete') => void }

const EditableVideoDisplay: React.FC<EditableVideoDisplayPropType> = (props) => {
  const [currentDisplay, setCurrentDisplay] = React.useState<'title' | 'url'>('title')
  const isDefault = props.video.id === ''
  if (isDefault && currentDisplay === 'title') {
    setCurrentDisplay('url')
  }

  const [isDeleted, setIsDeleted] = React.useState<boolean>(false)
  const [animationHook, setAnimationHook] = React.useState<'' | 'fade-away'>('')
  const url = isDefault ? '' : `youtube.com/watch?v=${props.video.id} `

  if (isDeleted) {
    return <></>
  }

  return (
    <div className={`editor-video-display ${animationHook} `} >
      <IconedButton iconName="cross" className='button-remove-video' onClick={async () => {
        setAnimationHook('fade-away')
        await sleep(300)
        setIsDeleted(true)
        props.setEditedVideo('delete')

      }} />
      <input type='text' value={props.video.title} className='charter-display' readOnly={true}
        onClick={() => {
          setCurrentDisplay('url')
        }}
        style={{
          display: currentDisplay === 'title' ? 'flex' : 'none'
        }} />
      <input autoFocus={!
        (props.index === 0 && props.video.id === "")} type='text' placeholder="Youtube URL" defaultValue={url} className='charter-display' readOnly={!isDefault}
        onBlur={(e) => {
          window.YoutubeRadio.getYoutubeTitleFromID(parseYoutubeVideoURL(e.target.value).id)
            .then(title => {
              props.setEditedVideo({
                id: parseYoutubeVideoURL(e.target.value).id,
                title: title
              })
              setCurrentDisplay('title')
            })
        }}

        style={{
          display: currentDisplay === 'url' ? 'flex' : 'none'
        }} />
    </div >
  )
}

const ButtonSavePlaylist: React.FC<{ playlistEdited: Playlist }> = (props) => {

  const appState = React.useContext(ContextAppState)
  const dispatch = React.useContext(ContextDispatchAppState)

  const isValidPlaylistName = new MultipileConditions()
  const isValidPlaylistURL = new MultipileConditions()
  const isValidVideos = new MultipileConditions()

  const parsedPlaylistURL = parsePlaylistURL(getPlaylistURLFromPlaylistID(props.playlistEdited.playlistID))

  isValidPlaylistName
    .add(props.playlistEdited.name.length > 0)
    .add(!appState.playlists.map(pl => pl.name).includes(props.playlistEdited.name), props.playlistEdited.name !== appState.targetPlaylist.name)


  isValidPlaylistURL
    .add(parsedPlaylistURL.host === 'www.youtube.com')
    .add(parsedPlaylistURL.id.length === 34)
    .add(parsedPlaylistURL.protocol === 'https:')


  isValidVideos
    .add(props.playlistEdited.videos
      .map(v => parseYoutubeVideoURL(getYoutubeURLFromID(v.id)))
      .map(p => (p.host === 'www.youtube.com' && p.id.length === 11 && p.protocol === 'https:'))
      .reduce((c, p) => c && p, true)
    )
    .add(props.playlistEdited.videos.length > 0)

  let isValidEdit = false;

  if (props.playlistEdited.type === 'youtube') {
    isValidEdit = isValidPlaylistName.reduce() && isValidPlaylistURL.reduce()
  } else if (props.playlistEdited.type === 'youtube_radio') {
    isValidEdit = isValidPlaylistName.reduce() && isValidVideos.reduce()
  }

  return (
    <IconedButton iconName="save" id="button-save-playlist"
      style={{
        color: isValidEdit ? '#353535' : '#A6A6A6'
      }}
      onClick={async () => {
        if (isValidEdit) {
          dispatch({
            type: 'edit-target-playlist',
            props: {
              playlist: props.playlistEdited

            }
          })
          dispatch({
            type: 'animation-end'
          })
          await window.YoutubeRadio.editPlaylist(appState.targetPlaylist.name, props.playlistEdited)
          reloadPlaylistsWithAnimation(dispatch)
        }
      }} />

  )
}

function loadPlaylist(name: string, index: number = 0) {
  window.YoutubeRadio.loadPlaylist(name, index)
}

function navigatePlaylist(navigation: playlistNavigation) {
  window.YoutubeRadio.navigatePlaylist(navigation)
}

type VideoURL = {
  protocol: string
  id: string
  host: string
}

export function parseYoutubeVideoURL(url: string): VideoURL {
  const reIncludesHttps = /^https:\/\//;
  url = reIncludesHttps.test(url) ? url : `https://${url}`
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

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

function getYoutubeThumbnailURLFromID(videoID: string): string {
  return videoID.length === 11 ? `https://img.youtube.com/vi/${videoID ?? ''}/sddefault.jpg` : ''
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
