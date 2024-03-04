import * as React from 'react'
import { ContextAppState } from '../main'

import PlaylistDetailDisplay from './playlist-detail'
import PlaylistEditorDisplay from './playlist-editor'
import PlaylistTypeSelection from './playlist-selection'
import PlaylistsDisplay from './playlists'
import Fallback from './fallback'
import { blob } from 'stream/consumers'


export const Icons = {
  pin: 'fas fa-thumbtack',
  play: 'fas fa-play',
  arrowLeft: 'fa-solid fa-arrow-left',
  note: 'fa-solid fa-music',
  shuffle: 'fa-solid fa-shuffle',
  pencil: 'fa-solid fa-pencil',
  trashBin: 'fa-solid fa-trash',
  save: 'fa-solid fa-floppy-disk',
  close: 'fas fa-times-circle',
  cross: 'fas fa-times',
  plusCircle: 'fas fa-plus-circle',
  iconYoutube: 'fa-brands fa-youtube',
  reorder: 'fas fa-arrow-right-arrow-left'
} as const;


type IconedButtonPropsType = {
  iconName: keyof typeof Icons
} & JSX.IntrinsicElements['i'];

export const IconedButton: React.FC<IconedButtonPropsType> = (props) => {
  const className = (props.className ?? "") + ` ${Icons[props.iconName]} `
  return <i {...props} className={className}></i>
}
export const Wrapper: React.FC<{ wrapTarget: 'playlist-display-wrapper' | 'playlist-detail-display-wrapper' | 'playlist-editor-wrapper' | 'playlist-type-selection-wrapper', index: number, children: React.ReactNode[] | React.ReactNode }> = (props) => {
  const appState = React.useContext(ContextAppState)
  return <div id={props.wrapTarget} className={`${appState.switchAnimationHook[props.index]}`} style={{ pointerEvents: appState.isAnimating ? 'none' : 'auto' }}>{props.children}</div>
}

async function fetchImageResource(src: string): Promise<Blob> {
  try {
    const data = await fetch(src);
    const blob = await data.blob();
    return blob;
  } catch (err) {
    console.error(err);
  }
  return new Blob([]);
}

const ImageBlobStorage = new Map<string, Blob>();


export const Thumbnail: React.FC<JSX.IntrinsicElements['img']> = (props) => {
  const [imgURL, setImgURL] = React.useState("");

  React.useEffect(() => {
    if (props.src !== undefined) {
      if (ImageBlobStorage.has(props.src)) {
        const url = URL.createObjectURL(ImageBlobStorage.get(props.src)!);
        setImgURL(url);
      } else {
        fetchImageResource(props.src ?? "").then(blob => {
          const url = URL.createObjectURL(blob);
          setImgURL(url);
          ImageBlobStorage.set(props.src!, blob);
        })
      }
    }
  }, [props.src]);

  return <img {...props} src={imgURL}></img>
};

export const FallbackReloadPlaylist = Fallback;

export const Displays = {
  'playlists': (index: number) => <PlaylistsDisplay index={index} />,
  'playlist-detail': (index: number) => <PlaylistDetailDisplay index={index} />,
  'playlist-editor': (index: number) => <PlaylistEditorDisplay index={index} />,
  'playlist-type-selection': (index: number) => <PlaylistTypeSelection index={index} />
} as const


type WrapElmTagName = 'div' | 'span';
type ReactStateFuncReturnType<T> = ReturnType<typeof React.useState<T>>;

export function useDnDswapList<T>(listFactory: () => Array<T & { key: any }>, deps: any[]): [...ReactStateFuncReturnType<number[]>, T[]] {

  const list = React.useMemo(listFactory, deps);

  const [order, setOrder] = React.useState<number[]>(list.map((_, i) => i));
  const previousKeyRef = React.useRef(list.map(e => e.key));

  React.useMemo((): void => {
    const maxOrder = order.reduce((p, c) => p > c ? p : c, -1);
    if (list.length > order.length) {
      const order2append = [];
      for (let i = 1; i <= list.length - order.length; i++) {
        order2append.push(maxOrder + i);
      }
      setOrder([...order, ...order2append]);
    } else if (list.length < order.length) {
      const rmDiff = previousKeyRef.current.filter(k => !list.map(e => e.key).includes(k)).map(diff => previousKeyRef.current.findIndex(k => k === diff)).filter(i => i >= 0);
      const rmvdOrder = order.filter((i) => !rmDiff.includes(i));
      setOrder(rmvdOrder.map(e => [...rmvdOrder].sort((r, l) => r > l ? 1 : -1).findIndex(i => i === e)));
    }
    previousKeyRef.current = list.map(e => e.key);
  }, [list]);

  return [order, setOrder as ReactStateFuncReturnType<number[]>[1], list];
};

interface DnDSwapListPropsType<K extends WrapElmTagName> {
  dnd: [...ReactStateFuncReturnType<number[]>, React.ReactNode[]]
  wrapElmTagName?: K
  wrapElmProps?: JSX.IntrinsicElements[K]
}

export const DnDSwapListProvider = <K extends WrapElmTagName>(props: DnDSwapListPropsType<K>): React.ReactElement[] => {
  const [order, setOrder, children] = props.dnd;
  const swapTargetRef = React.useRef<number | 'no-drag'>('no-drag');
  const getRef = React.useCallback(() => swapTargetRef, []);
  const childrenMemo = React.useMemo(() => children, [children]);
  const elmPropsMemo = React.useMemo(() => props.wrapElmProps, []);

  const swap = React.useCallback((dragEntered: number | 'no-drag', swapTarget: number | 'no-drag') => {
    if (swapTarget !== 'no-drag' && dragEntered !== 'no-drag') {
      setOrder((o) => {
        if (order !== undefined) {
          [o![dragEntered], o![swapTarget]] = [o![swapTarget], o![dragEntered]];
          return [...o!];
        }
        return [...o!];
      });
      swapTargetRef.current = dragEntered;
    }
  }, []);

  return order!.map((e: number, i: number) => <DragableElm wrapElmTagName={props.wrapElmTagName ?? "div"} wrapElmProps={elmPropsMemo ?? {}} key={e} index={i} getSwapTarget={getRef} swap={swap}>{childrenMemo[e]}</DragableElm >)
};

interface DragablePropsType<K extends WrapElmTagName> {
  children?: React.ReactNode,
  index: number,
  getSwapTarget: () => React.MutableRefObject<number | 'no-drag'>,
  swap: (ir: number | 'no-drag', il: number | 'no-drag') => void,
  wrapElmTagName: K,
  wrapElmProps: JSX.IntrinsicElements[K]
}


const DragableElmImpl = <K extends WrapElmTagName>(props: React.PropsWithChildren<DragablePropsType<K>>): JSX.Element => {
  const elmProps = props.wrapElmProps;

  const dragEventHandler: JSX.IntrinsicElements[K] = {
    ...props.wrapElmProps,
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => {
      (elmProps.onDragStart ?? ((_: any) => { }))(e)
      props.getSwapTarget().current = props.index;
    },
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => {
      (elmProps.onDragEnd ?? ((_: any) => { }))(e)
      props.getSwapTarget().current = 'no-drag'
    },
    onDragEnter: (e: React.DragEvent<HTMLDivElement>) => {
      (elmProps.onDragEnter ?? ((_: any) => { }))(e)
      e.preventDefault()
      props.swap(props.index, props.getSwapTarget().current)
    },
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => {
      (elmProps.onDragEnter ?? ((_: any) => { }))(e)
      e.preventDefault()
    },
    draggable: true,
    children: props.children
  }

  const elm = React.createElement(props.wrapElmTagName, dragEventHandler);
  return elm;
};

const DragableElm = React.memo(DragableElmImpl);

