import React = require('react');
import ReactDOM = require('react-dom');
import _ = require('lodash');
import electron = require('electron');
import Promise = require('bluebird');

const url = require('url');

interface Props { }
interface State { }
class App extends React.Component<Props, State> {
    private repoWindows: Array<Object>;
    constructor(props: Props) {
        super(props);
        this.repoWindows = [];
    }

    private showOpenDialog(...args): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            electron.remote.dialog.showOpenDialog({ properties: ['openDirectory'] }, resolve);
        });
    }

    private selectNewRepo() {
        this.showOpenDialog({ properties: ['openDirectory'] })
            .then(filenames => {
                const filename: string = filenames[0];
                localStorage.setItem('setOpenRepo', filename);

                const newWindow = new electron.remote.BrowserWindow({ width: 800, height: 600 });
                newWindow.loadURL(url.format({
                    pathname: process.cwd() + '/index.html',
                    protocol: 'file:',
                    slashes: true
                }));

                this.repoWindows.push(newWindow);
                newWindow.on('closed', () => this.repoWindows.splice(newWindow));

                newWindow.webContents.openDevTools();
            });
    }

    render() {
        return <div>
            <button onClick={this.selectNewRepo.bind(this)}>
                Select a new repository
	    </button>
        </div>
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
