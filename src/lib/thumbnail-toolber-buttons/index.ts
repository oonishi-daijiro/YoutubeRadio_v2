import * as Electron from "electron";

function getThumbarIcon(iconName: string): Electron.NativeImage {
  const image = Electron.nativeImage.createFromPath(
    __dirname + "/lib/thumbnail-toolber-buttons/buttons/" + iconName + ".png"
  );
  return image;
}

export class YoutubeRadioThumbarButtons {
  constructor(targetWindow: Electron.BrowserWindow) {
    this.targetWindow = targetWindow;
  }
  targetWindow: Electron.BrowserWindow;
  play: Electron.ThumbarButton = {
    icon: getThumbarIcon("play"),
    click: (): void => {
      this.targetWindow.setThumbarButtons([
        this.previousVideo,
        this.pause,
        this.nextVideo,
      ]);
      this.targetWindow.webContents.send("req-play-video");
    },
  };
  pause: Electron.ThumbarButton = {
    icon: getThumbarIcon("pause"),
    click: (): void => {
      this.targetWindow.setThumbarButtons([
        this.previousVideo,
        this.play,
        this.nextVideo,
      ]);
      this.targetWindow.webContents.send("req-pause-video");
    },
  };
  previousVideo: Electron.ThumbarButton = {
    icon: getThumbarIcon("previous"),
    click: (): void => {
      this.targetWindow.webContents.send("req-previous-video");
    },
  };
  nextVideo: Electron.ThumbarButton = {
    icon: getThumbarIcon("next"),
    click: (): void => {
      this.targetWindow.webContents.send("req-next-video");
    },
  };
}
