import { Hg } from './hg';
import { Source } from './repository';
import React = require('react');
import ReactDOM = require('react-dom');
import _ = require('lodash');


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


export module PendingChange {
    export class Component extends React.Component<Props, State> {
        private timerId;
        private repo: Source.Repository<Hg>;
        constructor(props) {
            super(props);
            this.repo = props.repo;
            this.state = { status: null, commitMsg: '', pendingAddsRemoves: [], entryStyles: {}};
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

        handleFileClick(entry: FileEntry, event: Event) {
	    this.setState((prevState: State, props: Props) => {
		prevState.pendingAddsRemoves.push(entry.fileName);
		prevState.entryStyles[entry.fileName]
		= prevState.entryStyles[entry.fileName] || {};
		prevState.entryStyles[entry.fileName].backgroundColor = "green";
		return {
		    entryStyles: prevState.entryStyles,
		    pendingAddsRemoves: prevState.pendingAddsRemoves
		} as State
	    });
        }

        handleSubmit(event: Event) {
            event.preventDefault();
            this.repo.Commit(this.state.commitMsg)
                .then(() => {
                    this.setState({
                        commitMsg: ''
                    } as State);
                })
                .catch((error) => {
                    alert(`There has been a problem while attempting to commit, ${error.stdout}`);
                });
        }

        render() {
            const listItems = _(this.state.status)
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
                    <ul>{listItems}</ul>
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
