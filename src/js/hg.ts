declare const GitGraph;
declare const Promise;
// var app = require('electron').remote;
// var dialog = app.dialog;
// dialog.showOpenDialog(function (fileName) {
// });
const cwd: string = process.cwd();
const hg = require(cwd + '/src/cpp/build/Release/hg');

class HgRepo {
    private repo;

    constructor(public fullPath: string) {
        this.repo = new hg.repo();
    }

    public status(): any {
        return this.repo.status('foo', function (result) {
            console.log(arguments);
        });
        //        return new Promise((resolve) => this.repo.status("status", resolve));
    }
}

const myRepo: HgRepo = new HgRepo(cwd);
myRepo.status();

// require(cwd + '/gitgraph.js/build/gitgraph.min.js');

// var gitgraph = new GitGraph({
//     template: "metro",
//     orientation: "horizontal",
//     mode: "compact"
// });

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
