import { Hg } from './hg';
import { Source } from './repository';
import { Diff } from './diff-component';
import { PendingChange } from './pending-change-component';
import { Tree } from './tree-component';
import React = require('react');
import ReactDOM = require('react-dom');
import _ = require('lodash');

// Initalize Repo
let Repo = new Source.Repository<Hg>(Hg, process.cwd());
interface Props { }
interface State { }
class App extends React.Component<Props, State> {
    render() {
        return <div>
            <Diff.Component repo={Repo} />
            <PendingChange.Component repo={Repo} />
            <Tree.Component repo={Repo} />
        </div>
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
