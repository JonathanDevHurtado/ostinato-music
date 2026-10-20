import is from 'electron-is';

import type { BrowserWindow } from 'electron';

const PICTURE_IN_PICTURE_FRAME_NAME = 'blyrics-pip';

let pictureInPictureWindow: BrowserWindow | null = null;

export const trackPictureInPictureWindow = (win: BrowserWindow): void => {
  win.webContents.on('did-create-window', (child, details) => {
    if (details.frameName !== PICTURE_IN_PICTURE_FRAME_NAME) return;
    pictureInPictureWindow = child;
    child.once('closed', () => {
      if (pictureInPictureWindow === child) pictureInPictureWindow = null;
    });
  });
};

const hasPictureInPictureWindow = (): boolean =>
  pictureInPictureWindow !== null && !pictureInPictureWindow.isDestroyed();

export const hideMainWindow = (win: BrowserWindow): void => {
  // Linux window managers stop presenting a hidden window's child surfaces, so the floating
  // lyrics window drops to a crawl when the opener is hidden. Minimizing keeps it painting.
  if (is.linux() && hasPictureInPictureWindow()) {
    win.setSkipTaskbar(true);
    win.minimize();
    return;
  }

  win.hide();
};

export const showMainWindow = (win: BrowserWindow): void => {
  win.setSkipTaskbar(false);
  if (win.isMinimized()) win.restore();
  win.show();
};
