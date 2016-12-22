var Git = (function () {
    function Git() {
    }
    Git.prototype.Log = function (args) {
        return "git log " + args;
    };
    Git.prototype.ParseLog = function (result) {
        return [
            {
                "foo": "bar"
            }
        ];
    };
    return Git;
}());
module.exports = Git;
