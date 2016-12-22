/* const React = require('react');
 * 
 * 
 * React.DOM.render(
 *     <h1> Hello React!</h1>
 * );*/


import { Hg } from './hg.js';
import { Source } from './repository.js';
const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('lodash');
let Repo = new Source.Repository<Hg>(Hg, 'path');

class PendingChangeComponent extends React.Component {
    private state;
    private timerId;
    constructor(props) {
        super(props);
        this.state = { status: null, commitMsg: '' };
        this.tick();
    }

    componentDidMount() {
        this.timerId = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timerId);
    }

    tick() {
        Repo.Status().then(result => {
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
        Repo.Commit(this.state.commitMsg);
        this.setState({
            commitMsg: ''
        });
    }

    render() {
        const listItems = _(this.state.status)
            .map(entry =>
                <li key={entry.fileName}>{entry.changeType}: {entry.fileName}</li>
            ).value();
        return (
            <div>
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


class App extends React.Component {
    render() {
        return <div>
            <PendingChangeComponent />
        </div>
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
