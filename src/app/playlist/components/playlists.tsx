import * as React from 'react'
import { ContextAppState, ContextDispatchAppState, type preload } from '../main'
import { getYoutubeThumbnailURLFromID, pushDisplayWithAnimation, loadPlaylist, reorderPlaylists } from '../utils'
import { type PrimitivePlaylist } from '../../../lib/config'
import { IconedButton, Wrapper, Thumbnail, useDnDswapList, DnDSwapListProvider } from '.'

declare const window: preload

const PlaylistDisplay: React.FC<{ playlist: PrimitivePlaylist, index: number, isOrderEditing: boolean }> = (props) => {
  const playlistThumbnailSrc = getYoutubeThumbnailURLFromID((props.playlist.videos[0] ?? { id: '' }).id)
  const dispatch = React.useContext(ContextDispatchAppState)

  return (
    <div className="playlist-display">
      <Thumbnail src={playlistThumbnailSrc} className="thumbnail"></Thumbnail>
      <div
        className="playlist-title-display"
        onClick={() => {
          if (!props.isOrderEditing) {
            pushDisplayWithAnimation(dispatch, 'playlist-detail')
            dispatch({
              type: 'set-target-playlist',
              props: props.playlist
            })
          }
        }}>
        {props.playlist.name}
      </div>
      <IconedButton
        iconName="play"
        className="play-button"
        onClick={() => {
          if (!props.isOrderEditing) {
            loadPlaylist(props.playlist.name)
            dispatch({
              type: 'close-window'
            })
          }
        }} />
    </div >
  )
}

const PlaylistsDisplay: React.FC<{ index: number }> = (props) => {
  const dispatch = React.useContext(ContextDispatchAppState)
  const appState = React.useContext(ContextAppState)
  const [isOrderEditing, setIsOrderEditing] = React.useState(false);


  const dnd = useDnDswapList(() => appState.playlists.map((pl, i) => <PlaylistDisplay isOrderEditing={true} key={pl.name} playlist={pl} index={i} />), [appState.playlists]);
  const [order, setOrder] = dnd;

  let playlists = <></>;
  if (isOrderEditing) {
    const wrapElmProps: JSX.IntrinsicElements['div'] = {
      className: 'playlist-order-editor-wrapper'
    }
    playlists = <DnDSwapListProvider dnd={dnd} wrapElmTagName='div' wrapElmProps={wrapElmProps} />
  } else {
    playlists = <>{appState.playlists.map(playlist => <PlaylistDisplay isOrderEditing={false} playlist={playlist} index={props.index} key={playlist.name} />)}</>;
  }
  const handleOnclickSaveReorderedPlaylist = async (): Promise<void> => {
    await reorderPlaylists(dispatch, dnd[0]?.map(e => appState.playlists[e]).filter(pl => pl !== undefined) ?? appState.playlists);
    setIsOrderEditing(false);
    setOrder(order?.map((_, i) => i));
  }

  return (
    <Wrapper wrapTarget='playlist-display-wrapper' index={props.index}>
      <div id="playlists-display">
        {playlists}
        {!isOrderEditing ? <ButtonCreatePlaylist /> : <></>}
      </div>
      <ButtonCloseWindow />
      <ButtonPinPlayer />
      {!isOrderEditing ? <ButtonReorderPlaylists setIsOrderEditing={setIsOrderEditing} /> : <ButtonSaveReorderedPlaylists onClick={handleOnclickSaveReorderedPlaylist} />}
    </Wrapper>
  )
}

export default PlaylistsDisplay

const ButtonCreatePlaylist: React.FC = () => {
  const dispatch = React.useContext(ContextDispatchAppState)

  return (
    <div className='button-create-playlist' onClick={() => {
      pushDisplayWithAnimation(dispatch, 'playlist-type-selection')
    }}>
      <i className='fas fa-plus plus-icon'></i>
      
    </div>
  )
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
      title="プレイヤーを最前面に固定"
      onClick={async () => {
        const isPinned = await window.YoutubeRadio.pinPlayer()
        setIsPinned(isPinned)
      }}

      style={{
        color: isPinned ? '#353535' : '#909090'
      }}
    />
  )
}

const ButtonCloseWindow: React.FC = () => {
  const dispatch = React.useContext(ContextDispatchAppState);

  return <IconedButton
    title="閉じる"
    iconName="close"
    id="close-window"
    onClick={() => {
      dispatch({
        type: 'close-window'
      })
    }} />
}

const ButtonReorderPlaylists: React.FC<{ setIsOrderEditing: (b: boolean) => void }> = (props) => {
  return <IconedButton title="プレイリストを並び替え" iconName="reorder" id="button-reorder-playlists" onClick={() => { props.setIsOrderEditing(true) }} />
}

const ButtonSaveReorderedPlaylists: React.FC<{ onClick: () => void }> = (props) => {
  return <IconedButton title="保存" iconName="save" id="button-reorder-playlists" onClick={() => { props.onClick() }} />
}
