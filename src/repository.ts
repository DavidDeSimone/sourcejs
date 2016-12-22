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

    Status(args: string): string;
    ParseStatus(result: string): Array<Object>;
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

    public Status(args: string): PromiseLike<Array<Object>> {
        return this._exec(this.strategy.Status(args))
            .then(this.strategy.ParseStatus.bind(this.strategy));
    }
    public Log(args: string): PromiseLike<Array<Object>> {
        return this._exec(this.strategy.Log(args))
            .then(this.strategy.ParseLog.bind(this.strategy));
    }
}
