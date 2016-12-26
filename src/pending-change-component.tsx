import { Hg } from './hg.js';
import { Source } from './repository.js';

export module PendingChange {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const _ = require('lodash');


    export class Component extends React.Component {
        private state;
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
            // @TODO move out the commit message stuff into its own component
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
