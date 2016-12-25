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
    private repo: Source.Repository<Hg>;
    constructor(props) {
        super(props);
        this.repo = props.repo;
        this.state = { diff: '' };
    }

    tick() {
        this.repo.Diff().then(result => {
            if (result) {
                this.setState({
                    diff: result
                });
            }
        });
    }

    componentDidMount() {
        this.tick();
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
        this.repo.Commit(this.state.commitMsg);
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
    private repo: Source.Repository<Hg>;
    private graphTemplate: Object;
    private timerId: number;
    private renderInitalized: boolean;

    constructor(props) {
        super(props);
        this.repo = props.repo;
        this.state = {};
    }

    componentDidMount() {
        this.timerId = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.timerId);
    }

    tick() {
        this.repo.Branches().then(branches => {
            _(branches).forEach(branch => {
                this.repo.Log(`-b ${branch}`).then(commits => {
                    const branchStateValue = {
                        name: branch,
                        parent: null, // @TODO fill this out
                        commits: []
                    };
                    _(commits).forEach(commit => {
                        branchStateValue.commits.push({
                            message: commit.summary,
                            author: commit.user,
                            sha1: commit.hash
                        });
                    });
                    if ((!this.state[branch]) || (this.state[branch].commits[0].sha1
                        !== branchStateValue.commits[0].sha1)) {
                        const newState = {};
                        newState[branch] = branchStateValue;
                        this.setState(newState);
                    }
                });
            });
        });
    }

    render() {
        if (!this.graphTemplate) {
            var myTemplateConfig = {
                colors: ["#F00", "#0F0", "#00F"], // branches colors, 1 per column
                branch: {
                    lineWidth: 10,
                    spacingX: 25,
                    showLabel: true,                  // display branch names on graph
                },
                commit: {
                    spacingY: -80,
                    dot: {
                        size: 15
                    },
                    message: {
                        displayAuthor: true,
                        displayBranch: false,
                        displayHash: false,
                        font: "normal 12pt Arial"
                    },
                    tooltipHTMLFormatter: function (commit) {
                        return "" + commit.sha1 + "" + ": " + commit.message;
                    }
                }
            };
            this.graphTemplate = new GitGraph.Template(myTemplateConfig);
        }

        if (this.renderInitalized) {
            this.graph = new GitGraph({
                template: this.graphTemplate,
            });

            _(this.state).forOwn((branch, branchName) => {
                let graphBranch = this.graph.branch(branchName);
                _(branch.commits).forEach(graphBranch.commit.bind(graphBranch));
            });
        }

        this.renderInitalized = true;;
        return <canvas id="gitGraph"></canvas>;
    }
}


class App extends React.Component {
    render() {
        return <div>
            <DiffComponent repo={Repo} />
            <PendingChangeComponent repo={Repo} />
            <TreeComponent repo={Repo} />
        </div>
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
