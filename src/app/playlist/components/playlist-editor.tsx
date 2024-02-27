import * as React from 'react'
import { ContextAppState, ContextDispatchAppState, type preload } from '../main'
import {
  getYoutubeThumbnailURLFromID, isValidEdit,
  parseYoutubeVideoURL,
  parsePlaylistURL,
  popDisplayWithAnimation,
  sleep,
  reloadPlaylistsWithAnimation
} from '../utils'
import { IconedButton, Wrapper, Thumbnail } from '.'
import { type PrimitivePlaylist, type YoutubeVideo } from '../../../lib/config'

declare const window: preload
const PlaylistEditorDisplay: React.FC<{ index: number }> = (props) => {
  const appState = React.useContext(ContextAppState)
  const dispatch = React.useContext(ContextDispatchAppState)

  const [playlistEdit, setPlaylistEdit] = React.useState(appState.targetPlaylist)

  let videoEditor: string | number | boolean | JSX.Element | null = null

  if (playlistEdit.type === 'youtube') {
    videoEditor = <YoutubePlaylistVideosEditor playlistEdit={playlistEdit} setPlaylistEdit={setPlaylistEdit} />
  } else if (playlistEdit.type === 'youtube_radio') {
    videoEditor = <YoutubeRadioPlaylistVideosEditor playlistEdit={playlistEdit} setPlaylistEdit={setPlaylistEdit} />
  } else {
    videoEditor = <></>;
  }

  return (
    <Wrapper wrapTarget="playlist-editor-wrapper" index={props.index}>
      <div id="playlist-editor">
        <IconedButton iconName="arrowLeft" className="button-back" onClick={async () => { await popDisplayWithAnimation(dispatch) }} />
        <Thumbnail src={getYoutubeThumbnailURLFromID((appState.targetPlaylist.videos[0] ?? { id: '' }).id)} className="thumbnail-playlist-editor" style={{ background: 'aqua' }} />
        <PlaylistNameEditor playlistEdit={playlistEdit} setPlaylistEdit={setPlaylistEdit} />
        <div id="editor-video-content-display">{videoEditor}</div>
        <ButtonSavePlaylist playlistEdited={playlistEdit} />
      </div>
    </Wrapper>
  )
}

export default PlaylistEditorDisplay

const PlaylistNameEditor: React.FC<{ playlistEdit: PrimitivePlaylist, setPlaylistEdit: (pl: PrimitivePlaylist) => void }> = ({ setPlaylistEdit, playlistEdit }) => {
  const refNameInput = React.useRef<HTMLInputElement>(null);
  const appState = React.useContext(ContextAppState)

  return (
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
        ref={refNameInput!}
      />
    </div>)
}

const YoutubePlaylistVideosEditor: React.FC<{ playlistEdit: PrimitivePlaylist, setPlaylistEdit: (pl: PrimitivePlaylist) => void }> = ({ playlistEdit, setPlaylistEdit }) => {
  const playlistURL = playlistEdit.playlistID ? `www.youtube.com/playlist?list=${playlistEdit.playlistID} ` : ''
  const refURLInput = React.useRef<HTMLInputElement>(null);

  return <input
    type="text"
    placeholder="Youtube Playlist URL"
    defaultValue={playlistURL}
    className='playlist-url-input'
    spellCheck={false}
    ref={refURLInput}
    onClick={() => {
      refURLInput.current?.select()
    }}
    onChange={(event) => {
      setPlaylistEdit({
        ...playlistEdit,
        playlistID: parsePlaylistURL(event.target.value).id
      })
    }}
  />
}

const YoutubeRadioPlaylistVideosEditor: React.FC<{ playlistEdit: PrimitivePlaylist, setPlaylistEdit: (pl: PrimitivePlaylist) => void }> = ({ playlistEdit, setPlaylistEdit }) => {
  const videoKeys = React.useRef(playlistEdit.videos.map((_, i) => i))

  const setEditedVideo = (video: YoutubeVideo | 'delete', index: number) => {
    if (video === 'delete') {
      setPlaylistEdit({
        ...playlistEdit,
        videos: playlistEdit.videos.filter((_, i) => index !== i)
      })
      videoKeys.current.splice(index, 1)
    } else {
      playlistEdit.videos[index] = video
      setPlaylistEdit({
        ...playlistEdit
      })
    }
  }
  const videoEditor = playlistEdit.videos.map((video, index) => {
    return (
      <EditableVideoDisplay key={videoKeys.current[index]} video={video} index={index}
        setEditedVideo={(video) => { setEditedVideo(video, index) }} />)
  })

  const handleOnclickAddVideo = () => {
    const newKey = videoKeys.current.reduce((p, c) => p > c ? p : c, -1) + 1
    videoKeys.current.push(newKey)
    setPlaylistEdit({
      ...playlistEdit,
      videos: [...playlistEdit.videos, { id: '', title: '' }]
    })
  }

  return <>
    {videoEditor}
    {playlistEdit.videos.length < 100 ? <IconedButton iconName="plusCircle" id="button-add-video" onClick={handleOnclickAddVideo} /> : <></>}
  </>
}

interface EditableVideoDisplayPropType { video: YoutubeVideo, setEditedVideo: (option: YoutubeVideo | 'delete') => void, index: number }

const EditableVideoDisplay: React.FC<EditableVideoDisplayPropType> = (props) => {
  const [currentDisplay, setCurrentDisplay] = React.useState<'title' | 'url'>('title')

  const isDefault = props.video.id === ''
  if (isDefault && currentDisplay === 'title') {
    setCurrentDisplay('url')
  }

  const [isDeleted, setIsDeleted] = React.useState<boolean>(false)
  const [animationHook, setAnimationHook] = React.useState<'' | 'fade-away'>('')
  const url = isDefault ? '' : `youtube.com/watch?v=${props.video.id}`

  const handleDelete = async () => {
    setAnimationHook('fade-away')
    await sleep(400)
    setIsDeleted(true)
    props.setEditedVideo('delete')
  }

  const handleBlurUrlInput: React.FocusEventHandler<HTMLInputElement> = async (e) => {
    const id = parseYoutubeVideoURL(e.target.value).id
    if (id !== props.video.id) {
      const title = await window.YoutubeRadio.getYoutubeTitleFromID(parseYoutubeVideoURL(e.target.value).id)
      props.setEditedVideo({
        id: parseYoutubeVideoURL(e.target.value).id,
        title
      })
    }
    setCurrentDisplay('title')
  }

  if (isDeleted) {
    return <></>
  }

  return (
    <div className={`editor-video-display ${animationHook}`}>

      <IconedButton iconName="cross" className='button-remove-video' onClick={handleDelete} />

      <input type='text' value={props.video.title} className='charter-display' readOnly={true}
        onClick={() => { setCurrentDisplay('url') }}
        style={{ display: currentDisplay === 'title' ? 'flex' : 'none' }} />

      <input autoFocus={!(props.index === 0 && props.video.id === '')} type='text' placeholder="Youtube URL" defaultValue={url} className='charter-display' readOnly={!isDefault}
        onBlur={handleBlurUrlInput}
        style={{
          display: currentDisplay === 'url' ? 'flex' : 'none'
        }} />

    </div >
  )
}

const ButtonSavePlaylist: React.FC<{ playlistEdited: PrimitivePlaylist }> = (props) => {
  const appState = React.useContext(ContextAppState)
  const dispatch = React.useContext(ContextDispatchAppState)

  const isValid = isValidEdit(props.playlistEdited)

  return (
    <IconedButton iconName="save" id="button-save-playlist"
      style={{
        color: isValid ? '#353535' : '#A6A6A6'
      }}
      onClick={async () => {
        if (isValid) {
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
