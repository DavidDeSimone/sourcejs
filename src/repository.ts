declare const GitGraph;
declare const Promise;
// var app = require('electron').remote;
// var dialog = app.dialog;
// dialog.showOpenDialog(function (fileName) {
// });
const cwd: string = process.cwd();
const exec = require('child_process').exec;
const _ = require('lodash');
const Git = require('./git.js');
const Hg = require('./hg.js');
require(cwd + '/gitgraph.js/build/gitgraph.min.js');

interface RepositoryImplementation {
    Log(args: string): string;
    ParseLog(result: string): Array<Object>;
}

class Repository<T extends RepositoryImplementation> {
    private repo;
    private strategy: T;
    constructor(c: { new (): T; }, public fullPath: string) {
        this.strategy = new c();
    }

    private _exec(command: string): any {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(error, stderr);
                } else {
                    resolve(stdout);
                }
            })
        });
    }

    public status(): any {
        return this._exec('git status');
    }
    public log(args: string): any {
        return this._exec(this.strategy.Log(args))
            .then(this.strategy.ParseLog.bind(this));
    }
}



var foo = new Repository<Hg>(Hg, cwd);
foo.log('-3')
    .then(console.log.bind(console));

var gitgraph = new GitGraph({
    template: "metro",
    orientation: "horizontal",
    mode: "compact"
});

// var master = gitgraph.branch("master");
// gitgraph.commit().commit().commit();         // 3 commits upon HEAD
// var develop = gitgraph.branch("develop");    // New branch from HEAD
// var myfeature = develop.branch("myfeature"); // New branch from develop

// // Well, if you need to go deeper…
// var hotfix = gitgraph.branch({
//     parentBranch: develop,
//     name: "hotfix",
//     column: 2             // which column index it should be displayed in
// });

//module.exports = hg;
