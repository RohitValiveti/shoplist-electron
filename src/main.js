const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWin;
let addWin;

// Listen for app to be ready

app.on('ready',function(){
  //create new window
  mainWin = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  // load html into window
  mainWin.loadURL(url.format({
    pathname: path.join(__dirname, '../dist/mainWin.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Quit app when closed
  mainWin.on('closed', function(){
    app.quit()
  });

  // Build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  
  // Insert menu
  Menu.setApplicationMenu(mainMenu);
});

// Handle create add window
const createAddWindow = () => {
  addWin = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Shopping List Item',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  // load html into window
  addWin.loadURL(url.format({
    pathname: path.join(__dirname, '../dist/addWin.html'),
    protocol: 'file:',
    slashes: true
  }));
  // Garbage Collection handle
  addWin.on('close', function(){
    addWin =null
  });
}

// catch item:add
ipcMain.on('item:add', (e,item) =>{
  mainWin.webContents.send('item:add', item);
  addWin.close();
})

// Create menu template
const mainMenuTemplate = [
{
  label: 'File',
  submenu: [
    {
      label: 'Add Item',
      click(){
        createAddWindow();
      }
    },
    {
      label: 'Clear Items',
      click(){
        mainWin.webContents.send('item:clear');
      }
    },
    {
      label: 'Quit',
      // keyboard shortcut
      accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
      click(){
        app.quit();
      }
    }
  ]
}
];

if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({label: ''});
}

// add Dev tools item if not in prod
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [{
      label: "Toggle DevTools",
      acc: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
      click(item, focusedWindow){
         focusedWindow.toggleDevTools();
      },
    },
    {
      role: "reload"
    }
    ] 
  });
}