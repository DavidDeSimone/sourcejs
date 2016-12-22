// var app = require('electron').remote;
// var dialog = app.dialog;
// dialog.showOpenDialog(function (fileName) {
// });
var cwd = process.cwd();
var exec = require('child_process').exec;
var _ = require('lodash');
require(cwd + '/gitgraph.js/build/gitgraph.min.js');
var Repository = (function () {
    function Repository(fullPath) {
        this.fullPath = fullPath;
    }
    Repository.prototype._exec = function (command) {
        return new Promise(function (resolve, reject) {
            exec(command, function (error, stdout, stderr) {
                if (error) {
                    reject(error, stderr);
                }
                else {
                    resolve(stdout);
                }
            });
        });
    };
    Repository.prototype.status = function () {
        return this._exec('git status');
    };
    Repository.prototype.log = function () {
        return this._exec('git log -5')
            .then(function (result) {
            var arr = result.split('\n');
            var returnValue = [];
            for (var i = 5; i < arr.length; ++i) {
            }
        });
    };
    return Repository;
}());
var myRepo = new GitRepo(cwd);
var gitgraph = new GitGraph({
    template: "metro",
    orientation: "horizontal",
    mode: "compact"
});
myRepo.log()
    .then(console.log.bind(console));
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
