import * as React from 'react';
import { ContextAppState, ContextDispatchAppState, preload } from "../main";
import { getYoutubeThumbnailURLFromID } from '../utils';
import { IconedButton, Wrapper, Thumbnail } from '.';
import { PrimitivePlaylist, YoutubeVideo } from "../../../lib/config";
import {
   parseYoutubeVideoURL,
   parsePlaylistURL,
   popDisplayWithAnimation,
   MultipileConditions,
   sleep,
   getPlaylistURLFromPlaylistID,
   getYoutubeURLFromID,
   reloadPlaylistsWithAnimation
} from '../utils'

declare const window: preload
const PlaylistEditorDisplay: React.FC<{ index: number }> = (props) => {
   const appState = React.useContext(ContextAppState)
   const dispatch = React.useContext(ContextDispatchAppState);



   const [playlistEdit, setPlaylistEdit] = React.useState(appState.targetPlaylist);
   const [videoKeys, setVideoKeys] = React.useState<number[]>(playlistEdit.videos.map((_, i) => i));

   const refNameInput = React.useRef<HTMLInputElement>();
   const refURLInput = React.useRef<HTMLInputElement>();

   let videoEditor: string | number | boolean | JSX.Element

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
         {playlistEdit.videos.map((video, index) => {
            return (
               <EditableVideoDisplay key={videoKeys[index]} video={video} index={index}
                  setEditedVideo={(video) => {
                     if (video === "delete") {
                        setPlaylistEdit({
                           ...playlistEdit,
                           videos: playlistEdit.videos.filter((_, i) => index !== i)
                        });
                        setVideoKeys(videoKeys.filter((_, i) => i !== index));

                     } else {
                        playlistEdit.videos[index] = video;
                        setPlaylistEdit({
                           ...playlistEdit
                        })
                     }
                  }} />)
         }
         )}
         {playlistEdit.videos.length < 100 ? <IconedButton iconName="plusCircle" id="button-add-video" onClick={() => {
            const newKey = videoKeys.reduce((p, c) => p > c ? p : c, -1) + 1;
            setVideoKeys([...videoKeys, newKey]);
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

export default PlaylistEditorDisplay;



type EditableVideoDisplayPropType = { video: YoutubeVideo, setEditedVideo: (option: YoutubeVideo | 'delete') => void, index: number }

const EditableVideoDisplay: React.FC<EditableVideoDisplayPropType> = (props) => {
   const [currentDisplay, setCurrentDisplay] = React.useState<'title' | 'url'>('title')

   const isDefault = props.video.id === ''
   if (isDefault && currentDisplay === 'title') {
      setCurrentDisplay('url')
   }

   const [isDeleted, setIsDeleted] = React.useState<boolean>(false);
   const [animationHook, setAnimationHook] = React.useState<'' | 'fade-away'>('')
   const url = isDefault ? '' : `youtube.com/watch?v=${props.video.id}`

   if (isDeleted) {
      return <></>
   }

   return (
      <div className={`editor-video-display ${animationHook}`}>
         <IconedButton iconName="cross" className='button-remove-video' onClick={async () => {
            setAnimationHook('fade-away');
            await sleep(400);
            setIsDeleted(true);
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
            onBlur={async (e) => {
               const id = parseYoutubeVideoURL(e.target.value).id
               if (id !== props.video.id) {
                  const title = await window.YoutubeRadio.getYoutubeTitleFromID(parseYoutubeVideoURL(e.target.value).id)
                  props.setEditedVideo({
                     id: parseYoutubeVideoURL(e.target.value).id,
                     title: title
                  })
               }
               setCurrentDisplay('title')
            }}

            style={{
               display: currentDisplay === 'url' ? 'flex' : 'none'
            }} />
      </div >
   )
}



const ButtonSavePlaylist: React.FC<{ playlistEdited: PrimitivePlaylist }> = (props) => {

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
   } else if (props.playlistEdited.type === "single_video") {
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
