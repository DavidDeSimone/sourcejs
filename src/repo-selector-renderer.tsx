import React = require('react');
import ReactDOM = require('react-dom');
import _ = require('lodash');
import electron = require('electron');
import Promise = require('bluebird');

const url = require('url');

const listStyle = {
    listStyleType: "none",
    verticalMargin: "25px",
    padding: 0,
    overflow: "hidden",
    backgroundColor: "#333",
};

const listItemStyle = {
    display: "block",
    padding: "10px",
    color: "white",
    textAlign: "center",
    hover: {
        backgroundColor: "#111"
    }
};

interface Props { }
interface State {
    hoverListStyle: Object,
}
class App extends React.Component<Props, State> {
    private repoWindows: Array<Object>;
    private recentlyOpenedRepos: Array<string>;
    constructor(props: Props) {
        super(props);
        this.repoWindows = [];
        this.recentlyOpenedRepos = JSON.parse(localStorage.getItem('recentlyOpenedRepos')) || [];
        this.state = { hoverListStyle: {} };
    }

    private showOpenDialog(): Promise<Array<string>> {
        return new Promise<Array<string>>((resolve, reject) => {
            electron.remote.dialog.showOpenDialog({ properties: ['openDirectory'] }, resolve);
        });
    }

    private openRepo(filename: string) {
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

        if (!_.includes(this.recentlyOpenedRepos, filename)) {
            this.recentlyOpenedRepos.push(filename);
            localStorage.setItem('recentlyOpenedRepos', JSON.stringify(this.recentlyOpenedRepos));
        }
    }

    private selectNewRepo() {
        this.showOpenDialog()
            .then(filenames => {
                if (filenames.length === 0) return;
                const filename: string = filenames[0];
                this.openRepo(filename);
            });
    }


    private setHover(elementIndex: number, hover: boolean) {
        this.setState((prevState: State, props: Props) => {
            prevState.hoverListStyle[elementIndex] = hover;
            return prevState;
        });
    }

    private onMouseEnter(elementIndex: number, proxy, event: Event) {
        this.setHover(elementIndex, true);
    }

    private onMouseLeave(elementIndex: number, proxy, event: Event) {
        this.setHover(elementIndex, false);
    }

    render() {
        let num: number = 0;
        const listItems = _(this.recentlyOpenedRepos)
            .map(entry => {
                num++;
                let style: any = _.clone(listItemStyle);
                if (this.state.hoverListStyle[num]) {
                    style = _.assign(style, style.hover);
                }

                return <li
                    key={entry + num}
                    style={style}
                    onMouseEnter={this.onMouseEnter.bind(this, num)}
                    onMouseLeave={this.onMouseLeave.bind(this, num)}
                    onClick={this.openRepo.bind(this, entry)}>{entry}</li>;
            })
            .value();
        return <div>
            <button onClick={this.selectNewRepo.bind(this)}>
                Select a new repository
	    </button>
            <ul style={listStyle}>{listItems}</ul>
        </div>
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
