import * as React from 'react'
import { ContextAppState, ContextDispatchAppState, type preload, type dispathFunc } from '../main'
import { type PrimitivePlaylist, type YoutubeVideo } from '../../../lib/config'
import { getYoutubeThumbnailURLFromID, pushDisplayWithAnimation, popDisplayWithAnimation, navigatePlaylist, loadPlaylist, getPlaylistURLFromPlaylistID } from '../utils'
import { IconedButton, Wrapper, Thumbnail } from '.'

declare const window: preload

const PlaylistDetailDisplay: React.FC<{ index: number }> = (props) => {
  const appState = React.useContext(ContextAppState)
  const dispatch = React.useContext(ContextDispatchAppState)
  return (
    <Wrapper wrapTarget='playlist-detail-display-wrapper' index={props.index}>
      <div className="playlist-detail-display">
        <IconedButton
          iconName="arrowLeft"
          className="button-back"
<<<<<<< Updated upstream
          onClick={async () => { await popDisplayWithAnimation(dispatch); }} />
=======
          onClick={() => popDisplayWithAnimation(dispatch)} />
>>>>>>> Stashed changes
        <PlaylistInformationDisplay playlist={appState.targetPlaylist} />
        <VideoListDisplay playlist={appState.targetPlaylist} />
      </div>
    </Wrapper>
  )
}

export default PlaylistDetailDisplay

const PlaylistNavigator: React.FC = () => {
  const dispatch = React.useContext(ContextDispatchAppState)
  const appState = React.useContext(ContextAppState)

  const playlistURLDisplay =
    <div spellCheck={false} className="yt-playlist-url-display"
<<<<<<< Updated upstream
      onClick={() => { window.YoutubeRadio.openExternal(getPlaylistURLFromPlaylistID(appState.targetPlaylist.playlistID ?? "")) }}>
=======
      onClick={() => window.YoutubeRadio.openExternal(getPlaylistURLFromPlaylistID(appState.targetPlaylist.playlistID))}>
>>>>>>> Stashed changes
      {`www.youtube.com/playlist?list=${appState.targetPlaylist.playlistID}`}
    </div>

  return (
    <div id="playlist-navigator">
      <ButtonPlay playlist={appState.targetPlaylist} />
      <ButtonShuffle />
      <ButtonDelete dispatch={dispatch} playlist={appState.targetPlaylist} />
      <ButtonEdit dispatch={dispatch} />
      {(appState.targetPlaylist.type === 'youtube' ? playlistURLDisplay : <></>)}
    </div>
  )
}

const ButtonPlay: React.FC<{ playlist: PrimitivePlaylist }> = (props) => {
  const handleOnClickButonPlayPl = () => {
    loadPlaylist(props.playlist.name)
    navigatePlaylist({
      shuffle: props.playlist.isShuffle
    })
    window.YoutubeRadio.close()
  }

<<<<<<< Updated upstream
=======
  const handleOnClickButonPlayPl = () => {
    loadPlaylist(props.playlist.name)
    navigatePlaylist({
      shuffle: props.playlist.isShuffle,
    })
    window.YoutubeRadio.close()
  }

>>>>>>> Stashed changes
  return <IconedButton
    iconName="play"
    className="button-play navigator"
    onClick={handleOnClickButonPlayPl}
  />
}

const PlaylistNameDisplay: React.FC<{ name: string }> = (props) => {
  return (
    <div id="playlist-name-display-wrapper">
      <div spellCheck={false} id="playlist-title-display">{props.name}</div>
    </div>
  )
}

const ButtonDelete: React.FC<{ dispatch: dispathFunc, playlist: PrimitivePlaylist }> = (props) => {
  return <IconedButton
    iconName="trashBin"
    className="button-remove navigator"
    onClick={() => {
      props.dispatch({
        type: 'delete-playlist',
        props: props.playlist.name
      })
      popDisplayWithAnimation(props.dispatch)
    }}
  />
}

const ButtonEdit: React.FC<{ dispatch: dispathFunc }> = (props) => {
  return <IconedButton
    iconName="pencil"
    className="button-edit"
<<<<<<< Updated upstream
    onClick={async () => await pushDisplayWithAnimation(props.dispatch, 'playlist-editor')}
  />
}
=======
    onClick={() => {
      pushDisplayWithAnimation(props.dispatch, 'playlist-editor')
    }}
  />
};
>>>>>>> Stashed changes

const NameDisplayAndNavigator: React.FC = () => {
  const appState = React.useContext(ContextAppState)
  return (
    <div id="name-display-and-navigator">
      <PlaylistNameDisplay name={appState.targetPlaylist.name} />
      <PlaylistNavigator />
    </div>
  )
}

<<<<<<< Updated upstream
const PlaylistInformationDisplay: React.FC<{ playlist: PrimitivePlaylist }> = (props) => {
=======
const PlaylistInformationDisplay: React.FC<{ playlist: PrimitivePlaylist }> = () => {
>>>>>>> Stashed changes
  const appState = React.useContext(ContextAppState)
  return (
    <div id="playlist-info-display">
      <Thumbnail src={getYoutubeThumbnailURLFromID(appState.targetPlaylist.videos[0].id)} className="playlist-thumbnail" />
      <NameDisplayAndNavigator />
    </div>
  )
}

const ButtonShuffle: React.FC = () => {
  const dispatch = React.useContext(ContextDispatchAppState)
  const appState = React.useContext(ContextAppState)
  const handleOnClickShuffle = () => {
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
  }

  return (
    <IconedButton
      iconName="shuffle"
      onClick={handleOnClickShuffle}
      style={{
        color: appState.targetPlaylist.isShuffle ? '#353535' : '#A6A6A6'
      }}
      className="button-shuffle navigator"
    />
  )
}

const VideoDisplay: React.FC<{
<<<<<<< Updated upstream
  video: YoutubeVideo
  videoIndex: number
=======
  video: YoutubeVideo,
  videoIndex: number,
>>>>>>> Stashed changes
  playlist: PrimitivePlaylist
}> = (props) => {
  const appstate = React.useContext(ContextAppState)

  const handleOnClickPlayVideoButton = () => {
    loadPlaylist(appstate.targetPlaylist.name, props.videoIndex)
    navigatePlaylist({
      shuffle: appstate.targetPlaylist.isShuffle
    })
    window.YoutubeRadio.close()
<<<<<<< Updated upstream
  }
=======
  };
>>>>>>> Stashed changes

  return (
    <div className="video-display">
      <IconedButton iconName="note" className="icon-music" />
      <CharterDisplay value={props.video.title} />
      <IconedButton iconName="play" className="button-playvideo" onClick={handleOnClickPlayVideoButton} />
    </div>
  )
}

const VideoListDisplay: React.FC<{ playlist: PrimitivePlaylist }> = (props) => {
  const appState = React.useContext(ContextAppState)
  return (
    <div className="videolist-display">
<<<<<<< Updated upstream
      {appState.targetPlaylist.videos.map((video, index) => (<VideoDisplay video={video} videoIndex={index} playlist={props.playlist} />))}
=======
      {appState.targetPlaylist.videos.map((video, index) => (<VideoDisplay key={index} video={video} videoIndex={index} playlist={props.playlist} />))}
>>>>>>> Stashed changes
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
      style={{
<<<<<<< Updated upstream
        pointerEvents: 'none'
=======
        pointerEvents: "none"
>>>>>>> Stashed changes
      }} />
  )
}
