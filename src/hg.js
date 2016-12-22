var Hg = (function () {
    function Hg() {
    }
    Hg.prototype.Log = function (args) {
        return "git log " + args;
    };
    Hg.prototype.ParseLog = function (result) {
        return [
            {
                "foo": "bar"
            }
        ];
    };
    return Hg;
}());
module.exports = Git;
