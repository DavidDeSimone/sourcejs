declare const global;
declare const Diff2HtmlUI;


import { Hg } from './hg.js';
import { Source } from './repository.js';
const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('lodash');
let dif2html = require("diff2html").Diff2Html;
// This is gross, but the diff UI helper needs jQuery in the global namespace
// @TODO find a better way to do this bullshit
global.$ = require('jquery');
require('./node_modules/diff2html/dist/diff2html-ui.js');
require('./gitgraph.js/build/gitgraph.min.js');

// Initalize Repo
let Repo = new Source.Repository<Hg>(Hg, process.cwd());

class DiffComponent extends React.Component {
    private state: Object;
    private timerId;
    constructor(props) {
        super(props);
        this.state = { diff: '' };
        this.tick();
    }

    tick() {
        Repo.Diff().then(result => {
            if (result) {
                this.setState({
                    diff: result
                });
            }
        });
    }

    componentDidMount() {
        this.timerId = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timerId);
    }

    render() {
        // @TODO need to clear out old diff window post commit
        if (this.state.diff) {
            const diffView = new Diff2HtmlUI({ diff: this.state.diff });
            diffView.draw('#diffView', { inputFormat: 'diff', showFiles: true, matching: 'lines' });
            diffView.highlightCode('#line-by-line');
        }
        return (
            <div id="diffView"></div>
        );
    }


}


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

class TreeComponent extends React.Component {
    private state: Object;
    private graph: Object;
    constructor(props) {
        super(props);
        this.state = { status: '' };
        this.graph = new GitGraph({
            template: "metro",
            orientation: "horizontal",
            mode: "compact"
        });
        this.tick();
    }

    tick() {
        Repo.Branches().then(branches => {
            _(branches).forEach(branch => {
                let graphBranch = this.graph.branch(branch);
                Repo.Log(`-b ${branch}`).then(commits => {
                    _(commits).forEach(commit => {
                        graphBranch.commit({
                            message: commit.summary,
                            author: commit.user,
                            sha1: commit.hash
                        });
                    });
                });
            });
        });
    }

    render() {
        return <div>Hello</div>
    }
}


class App extends React.Component {
    render() {
        return <div>
            <DiffComponent />
            <PendingChangeComponent />
            <TreeComponent />
        </div>
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
