//const hg = require('./src/cpp/build/Release/hg');


var gitgraph = new GitGraph({
    template: "metro",
    orientation: "horizontal",
    mode: "compact"
});

var master = gitgraph.branch("master");
gitgraph.commit().commit().commit();         // 3 commits upon HEAD
var develop = gitgraph.branch("develop");    // New branch from HEAD
var myfeature = develop.branch("myfeature"); // New branch from develop

// Well, if you need to go deeper…
var hotfix = gitgraph.branch({
    parentBranch: develop,
    name: "hotfix",
    column: 2             // which column index it should be displayed in
});




//module.exports = hg;
