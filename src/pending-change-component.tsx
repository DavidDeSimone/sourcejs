import { Hg } from './hg';
import { Source } from './repository';
import React = require('react');
import ReactDOM = require('react-dom');
import _ = require('lodash');


interface State {
    status: string,
    commitMsg: string,
}

interface Props {

}

export module PendingChange {
    export class Component extends React.Component<Props, State> {
        private timerId;
        private repo: Source.Repository<Hg>;
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
                this.setState({
                    status: result
                });
            });
        }

        handleTextInput(event: Event) {
            this.setState({
                commitMsg: event.target.value
            });
        }

        handleSubmit(event: Event) {
            event.preventDefault();
            this.repo.Commit(this.state.commitMsg)
                .then(() => {
                    this.setState({
                        commitMsg: ''
                    });
                })
                .catch((error) => {
                    alert(`There has been a problem while attempting to commit, ${error.stdout}`);
                });
        }

        render() {
            const listItems = _(this.state.status)
                .map(entry =>
                    <li key={entry.fileName}>{entry.changeType}: {entry.fileName}</li>
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
