/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, BrowserView } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import notifier from 'node-notifier';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('openUrl', (event, arg) => {
  console.log('主线程收到页面点击了Learn More', arg);
  shell.openExternal(arg);
  notifier.notify(
    {
      title: 111,
      message: 222,
    },
    (err, res) => {
      if (err) {
        console.log('error:', err);
      }
    }
  );
  event.sender.send('replay', '收到你点击了 Learn More');
});

ipcMain.on('value-to-max', (event, arg) => {
  notifier.notify({
    title: '提示',
    message: arg,
    icon: '../../assets/icon.svg',
  });
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1200,
    height: 600,
    // titleBarStyle: 'hidden',
    // maxWidth: 900,
    // maxHeight: 340,
    minHeight: 600,
    minWidth: 1200,
    maximizable: true, // 窗口是否可最大化。
    alwaysOnTop: true, // 窗口是否永远在别的窗口的上面。
    skipTaskbar: true, // 是否在任务栏中显示窗口。 默认值为 false。
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  function resetLockTimer() {
    mainWindow?.webContents.send('mouseScrolled');
  }

  mainWindow.on('focus', resetLockTimer);
  mainWindow.on('blur', resetLockTimer);

  // 监听鼠标事件改变 https://wizardforcel.gitbooks.io/electron-doc/content/api/web-contents.html
  // ps: 鼠标事件的改变即可作为用户操作指标,事件改变即说明鼠标发生偏移,因为目标对象改变
  mainWindow.webContents.on('cursor-changed', (event) => {
    // 在这里处理鼠标滚动事件
    mainWindow?.webContents.send('mouseScrolled');
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 监听来自渲染进程（设置页面）的IPC消息
ipcMain.on('window-size-change', (event, size) => {
  if (mainWindow) {
    mainWindow.setSize(size.width, size.height);
  }
});

// Listen for the 'toggle-fullscreen' event from the renderer process
ipcMain.on('toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

ipcMain.on('fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(true);
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
