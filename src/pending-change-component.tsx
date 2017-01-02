import { Repository } from './repository';
import React = require('react');
import ReactDOM = require('react-dom');
import _ = require('lodash');
import Promise = require('bluebird');

interface FileEntry {
    fileName: string,
    changeType: string,
    pending: boolean
}

interface State {
    status: Array<FileEntry>,
    commitMsg: string
}

interface Props {
    repo: Repository.Hg
}

const fileSelectionStyle: Object = {
    borderRadius: "25px",
    backgroundColor: "#778899",
    padding: "12px",
    color: "white",
};

const listStyle = {
    listStyleType: "none", paddingLeft: 0
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
            this.state = { status: null, commitMsg: '' };
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
                const map = {};
                _(this.state.status)
                    .forEach((entry: FileEntry) => map[entry.fileName] = entry.pending);

                _(result)
                    .reject((entry: FileEntry) => entry.changeType === '?' || entry.changeType === '!')
                    .forEach((entry: FileEntry) => {
                        if (!map.hasOwnProperty(entry.fileName)) {
                            entry.pending = true;
                        } else {
                            entry.pending = map[entry.fileName];
                        }
                    });

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

        private addRemoveFile(entry: FileEntry) {
            if (entry.changeType === '!') {
                this.repo.Remove(entry.fileName);
            } else if (entry.changeType === '?') {
                this.repo.Add(entry.fileName);
            }
        }


        handleFileClick(entry: FileEntry, event: Event) {
            this.setState((prevState: State, props: Props) => {
                entry.pending = !entry.pending;
                return prevState;
            });
            this.addRemoveFile(entry);
        }

        handleSubmit(event: Event) {
            event.preventDefault();

            const args = _(this.state.status)
                .filter((entry: FileEntry) => entry.pending)
                .map((entry: FileEntry) => ` ${entry.fileName}`)
                .value()
                .join(' ');

            this.repo.Commit(this.state.commitMsg, args)
                .then(this.setState.bind(this, { commitMsg: '' }))
                .catch((error) => {
                    console.log(error);
                    alert(`There has been a problem while attempting to commit, ${error}`);
                });
        }

        render() {
            const listItems = _(this.state.status)
                .reject((entry: FileEntry) => _.endsWith(entry.fileName, '.orig'))
                .map((entry: FileEntry) => {
                    let style: any = {};
                    if (entry.changeType !== '?' && entry.changeType !== '!') {
                        style = _.clone(fileSelectionStyle);
                        style.opacity = entry.pending ? 1 : 0.5;

                        if (entry.changeType === 'R') {
                            style.backgroundColor = "red";
                        } else if (entry.changeType === 'A') {
                            style.backgroundColor = "#73AD21";
                        }
                    }

                    return <li
                        key={entry.fileName}
                        onClick={this.handleFileClick.bind(this, entry)}
                        style={style}
                        >
                        {entry.changeType}: {entry.fileName}
                    </li>
                }).value();
            return (
                <div>
                    <b>File Status:</b>
                    <ul style={listStyle}>{listItems}</ul>
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
