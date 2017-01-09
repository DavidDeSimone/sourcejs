import { Repository } from './repository';
import { Diff } from './diff-component';
import { PendingChange } from './pending-change-component';
import { Tree } from './tree-component';
import { BranchList } from './branch-list-component';
import { ContextMenu, DefaultContextMenu } from './context-menu';
import React = require('react');
import ReactDOM = require('react-dom');
import _ = require('lodash');
import context = require('electron-context-menu');

const repoPath = localStorage.getItem('setOpenRepo');
console.log(`Opening new view for repo ${repoPath}`);
if (!repoPath) {
    console.error(`A repo path has not been properly selected. This is a fatal error, and suggestive of
	          bug in sourcejs. Please report this to the sourcejs github`);
}

// Initalize Repo.
let Repo = new Repository.Hg(repoPath);
interface Props { }
interface State { }
class App extends React.Component<Props, State> {
    render() {
        return <div>
            <Diff.Component repo={Repo} />
            <PendingChange.Component repo={Repo} />
            <BranchList.Component repo={Repo} />
            <Tree.Component repo={Repo} />
        </div>
    }
}

ReactDOM.render(<App />, document.getElementById('root'));
