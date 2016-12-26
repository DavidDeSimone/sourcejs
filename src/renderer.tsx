declare const global;
declare const Diff2HtmlUI;
declare const GitGraph;

import { Hg } from './hg.js';
import { Source } from './repository.js';
import { Diff } from './diff-component.js';
import { PendingChange } from './pending-change-component.js';
import { Tree } from './tree-component.js';
const React = require('react');
const ReactDOM = require('react-dom');
const _ = require('lodash');

// Initalize Repo
let Repo = new Source.Repository<Hg>(Hg, process.cwd());

class App extends React.Component {
    render() {
        return <div>
            <Diff.Component repo={Repo} />
            <PendingChange.Component repo={Repo} />
            <Tree.Component repo={Repo} />
        </div>
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
