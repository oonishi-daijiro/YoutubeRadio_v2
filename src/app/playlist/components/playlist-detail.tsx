import * as React from 'react'
import { ContextAppState, ContextDispatchAppState, type preload } from '../main'
import { type PrimitivePlaylist, type YoutubeVideo } from '../../../lib/config'
import { getYoutubeThumbnailURLFromID, pushDisplayWithAnimation, popDisplayWithAnimation, setCurrentPlaylistShuffle, loadPlaylist, getPlaylistURLFromPlaylistID } from '../utils'
import { IconedButton, Wrapper, Thumbnail } from '.'

declare const window: preload

const ContextSetPopupState = React.createContext<React.Dispatch<React.SetStateAction<boolean>>>((s): void => { });

const PlaylistDetailDisplay: React.FC<{ index: number }> = (props) => {
  const appState = React.useContext(ContextAppState)
  const dispatch = React.useContext(ContextDispatchAppState)

  const [isPopupShown, setIsPopupShown] = React.useState(false);

  return (
    <Wrapper wrapTarget='playlist-detail-display-wrapper' index={props.index}>
      <div className="playlist-detail-display" style={{
        pointerEvents: isPopupShown ? 'none' : 'auto',
      }}>
        <IconedButton
          iconName="arrowLeft"
          className="button-back"
          onClick={async () => { await popDisplayWithAnimation(dispatch) }} />
        <ContextSetPopupState.Provider value={setIsPopupShown}>
          <PlaylistInformationDisplay playlist={appState.targetPlaylist} />
          <VideoListDisplay playlist={appState.targetPlaylist} />
          {isPopupShown ? <PopupWhetherDelete playlistName={appState.targetPlaylist.name} /> : <></>}
        </ContextSetPopupState.Provider>
      </div>
    </Wrapper>
  )
}

export default PlaylistDetailDisplay

const PlaylistNavigator: React.FC = () => {
  const appState = React.useContext(ContextAppState)
  const setIsPopupShown = React.useContext(ContextSetPopupState);


  const playlistURLDisplay =
    <div spellCheck={false} className="yt-playlist-url-display"
      onClick={() => { window.YoutubeRadio.openExternal(getPlaylistURLFromPlaylistID(appState.targetPlaylist.playlistID ?? "")) }}>
      {`www.youtube.com/playlist?list=${appState.targetPlaylist.playlistID}`}
    </div>

  return (
    <div id="playlist-navigator">
      <ButtonPlay playlist={appState.targetPlaylist} />
      <ButtonShuffle />
      <ButtonDelete playlist={appState.targetPlaylist} onClick={() => { setIsPopupShown(true) }} />
      <ButtonEdit />
      {(appState.targetPlaylist.type === 'youtube' ? playlistURLDisplay : <></>)}
    </div>
  )
}

const PopupWhetherDelete: React.FC<{ playlistName: string }> = (props) => {
  const dispatch = React.useContext(ContextDispatchAppState);
  const setPlaylistShown = React.useContext(ContextSetPopupState);
  const [shouldHidePopup, setShouldHidePopup] = React.useState(false);

  const onClickYes = (): void => {
    dispatch({
      type: 'delete-playlist',
      props: props.playlistName
    })
    popDisplayWithAnimation(dispatch)
  };

  return (
    <div id="popup-wheter-delete" className={`pop-popup ${shouldHidePopup ? 'hide-popup' : ''}`}>
      <div id="popup-delete-message">このプレイリストを削除しますか？</div>
      <div id="wheter-delete-selection">
        <div id="wheter-delete-button-yes" className="yorn-button" onClick={async () => {
          setShouldHidePopup(true)
          await new Promise(resolve => setTimeout(resolve, 300));
          onClickYes()
        }}>はい</div>
        <div id="wheter-delete-button-no" className="yorn-button" onClick={async () => {
          setShouldHidePopup(true)
          await new Promise(resolve => setTimeout(resolve, 300));
          setPlaylistShown(false)
        }}>いいえ</div>
      </div>
    </div>
  )
}

const ButtonPlay: React.FC<{ playlist: PrimitivePlaylist }> = (props) => {
  const handleOnClickButonPlayPl = (): void => {
    loadPlaylist(props.playlist.name)
    window.YoutubeRadio.close()
  }

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

const ButtonDelete: React.FC<{ playlist: PrimitivePlaylist, onClick: () => void }> = (props) => {

  return <IconedButton
    iconName="trashBin"
    className="button-remove navigator"
    onClick={() => {
      props.onClick();
    }}
  />
}

const ButtonEdit: React.FC = () => {
  const dispatch = React.useContext(ContextDispatchAppState);
  return <IconedButton
    iconName="pencil"
    className="button-edit"
    onClick={() => {
      pushDisplayWithAnimation(dispatch, 'playlist-editor')
    }}
  />
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

const PlaylistInformationDisplay: React.FC<{ playlist: PrimitivePlaylist }> = (props) => {
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
  const handleOnClickShuffle = async (): Promise<void> => {
    dispatch({
      type: 'edit-target-playlist',
      props: {
        playlist: {
          ...appState.targetPlaylist,
          isShuffle: !appState.targetPlaylist.isShuffle
        }
      }
    })
    await window.YoutubeRadio.editPlaylist(appState.targetPlaylist.name, {
      ...appState.targetPlaylist,
      isShuffle: !appState.targetPlaylist.isShuffle
    })
    if (appState.targetPlaylist.name === appState.currentPlayingListName) {
      setCurrentPlaylistShuffle(!appState.targetPlaylist.isShuffle)
    }
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
  video: YoutubeVideo
  videoIndex: number
  playlist: PrimitivePlaylist
}> = (props) => {
  const appstate = React.useContext(ContextAppState)

  const handleOnClickPlayVideoButton = (): void => {
    loadPlaylist(appstate.targetPlaylist.name, props.videoIndex)
    window.YoutubeRadio.close()
  }

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
      {appState.targetPlaylist.videos.map((video, index) => (<VideoDisplay key={index} video={video} videoIndex={index} playlist={props.playlist} />))}
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
        pointerEvents: 'none'
      }} />
  )
}
