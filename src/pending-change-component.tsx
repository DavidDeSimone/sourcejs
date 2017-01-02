import { Repository } from './repository';
import React = require('react');
import ReactDOM = require('react-dom');
import _ = require('lodash');
import Promise = require('bluebird');

interface State {
    status: Array<Object>,
    commitMsg: string,
    pendingAddsRemoves: Array<string>,
    entryStyles: Object
}

interface Props {
    repo: Source.Repository<Hg>
}

interface FileEntry {
    fileName: string,
    changeType: string
}

const FileSelectionStyle: Object = {
    borderRadius: "25px",
    backgroundColor: "#73AD21",
    padding: "12px",
    color: "white",
};

enum Action {
    SELECT,
    UNSELECT,
    TOGGLE,
    SELECT_IF_UNINITALIZED
}


export module PendingChange {
    export class Component extends React.Component<Props, State> {
        private timerId;
        private repo: Repository.Hg;
        constructor(props) {
            super(props);
            this.repo = props.repo;
            this.state = { status: null, commitMsg: '', pendingAddsRemoves: [], entryStyles: {} };
        }

        componentDidMount() {
            this.tick();
            this.timerId = setInterval(() => this.tick(), 1000);
        }

        componentWillUnmount() {
            clearInterval(this.timerId);
        }

        tick() {
            this.repo.Status().then(result => {
                _(result)
                    .filter((entry: FileEntry) => entry.changeType !== '?')
                    .forEach((entry: FileEntry) =>
                        this.setFileVisibility(entry.fileName, Action.SELECT_IF_UNINITALIZED));
                this.setState({
                    status: result
                } as State);
            });
        }

        handleTextInput(event: Event) {
            this.setState({
                commitMsg: event.target.value
            } as State);
        }

        private setFileVisibility(fileName: string, action: Action) {
            this.setState((prevState: State, props: Props) => {
                // @TODO this shouldnt manipulate css state directly.
                // It should set variables that cause CSS to be set in render()
                let fileState = _.cloneDeep(prevState.entryStyles[fileName]);
                fileState = _.assign(fileState, FileSelectionStyle);

                switch (action) {
                    case Action.SELECT:
                        fileState.opacity = 1;
                        break;
                    case Action.UNSELECT:
                        fileState.opacity = 0.5;
                        break;
                    case Action.TOGGLE:
                        fileState.opacity = fileState.opacity === 1
                            ? 0.5 : 1;
                        break;
                    case Action.SELECT_IF_UNINITALIZED:
                        if (!fileState.hasOwnProperty('opacity')) {
                            fileState.opacity = 1;
                        }

                        break;
                }
                prevState.entryStyles[fileName] = fileState;
                return {
                    entryStyles: prevState.entryStyles
                } as State;
            });
        }

        private addFile(entry: FileEntry) {
            this.setState((prevState: State, props: Props) => {
                prevState.pendingAddsRemoves.push(entry.fileName);
                if (entry.changeType === '!') {

                } else if (entry.changeType === '?') {
                    this.repo.Add(entry.fileName);
                }

                return {
                    pendingAddsRemoves: prevState.pendingAddsRemoves
                } as State
            });
        }


        handleFileClick(entry: FileEntry, event: Event) {
            this.setFileVisibility(entry.fileName, Action.TOGGLE);
            this.addFile(entry);
        }

        handleSubmit(event: Event) {
            event.preventDefault();
            let args: string = '';
            _(this.state.status)
                .reject((entry: FileEntry) => {
                    // This is bad, it's UI state driving business logic. This should
                    // the other way around. 
                    return (!this.state.entryStyles[entry.fileName])
                        || this.state.entryStyles[entry.fileName].opacity !== 1;
                })
                .forEach((entry: FileEntry) => {
                    args += ` ${entry.fileName} `;
                });
            this.repo.Commit(this.state.commitMsg, args)
                .then(() => {
                    this.setState({
                        commitMsg: ''
                    } as State);
                })
                .catch((error) => {
                    console.log(error);
                    alert(`There has been a problem while attempting to commit, ${error}`);
                });
        }

        render() {
            const listItems = _(this.state.status)
                .reject(entry => _.endsWith(entry.fileName, '.orig'))
                .map(entry =>
                    <li
                        key={entry.fileName}
                        onClick={this.handleFileClick.bind(this, entry)}
                        style={this.state.entryStyles[entry.fileName] || {}}
                        >
                        {entry.changeType}: {entry.fileName}
                    </li>
                ).value();
            return (
                <div>
                    <b>File Status:</b>
                    <ul style={{ listStyleType: "none", paddingLeft: 0 }}>{listItems}</ul>
                    <form onSubmit={this.handleSubmit.bind(this)}>
                        <label>
                            Message:
          <input type="text" value={this.state.commitMsg} onChange={this.handleTextInput.bind(this)} />
                        </label>
                        <input type="submit" value="Submit" />
                    </form>
                </div>
            );
        }
    }

}
