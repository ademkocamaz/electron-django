const { app, BrowserWindow } = require('electron');
const path = require('path');

const { spawn } = require('node:child_process');

const startDjangoServer = () => {
  const djangoBackend = spawn('python', ['manage.py', 'runserver', '1408', '--noreload']);

  //djangoBackend.stdout.pipe(process.stdout)

  process.on('exit', function () {
    djangoBackend.kill();
  });

  djangoBackend.stdout.on('data', data => {
    console.log(`stdout:\n${data}`);
  });
  djangoBackend.stderr.on('data', data => {
    console.log(`stderr: ${data}`);
  });
  djangoBackend.on('error', (error) => {
    console.log(`error: ${error.message}`);
  });
  djangoBackend.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
  djangoBackend.on('message', (message) => {
    console.log(`message:\n${message}`);
  });
  return djangoBackend;
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  startDjangoServer();
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  //mainWindow.loadFile(path.join(__dirname, 'index.html'));
  const http = require('node:http')

  const options = {
    host: '127.0.0.1',
    port: 1408,
    path: '/',
    method: 'GET'
  };

  function check() {
    http.get(options, function (response) {
      // console.log('statusCode:', response.statusCode);
      // console.log('headers:', response.headers);

      mainWindow.loadURL('http://127.0.0.1:1408');

      mainWindow.once('ready-to-show', function () {
        mainWindow.show();
      });

      // Open the DevTools.
      // mainWindow.webContents.openDevTools();
      
    }).on('error', function (error) {
      // console.log('check_error:', error);
      setTimeout(check, 1000);
    });
  };

  check();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
