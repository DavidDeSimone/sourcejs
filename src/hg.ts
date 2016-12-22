declare const module;

class Hg {
    public Log(args: string): string {
        return "hg log " + args;
    }

    public ParseLog(result: string): Array<Object> {
        return [
            {
                "foo": "bar"
            }
        ]
    }
}


module.exports = Hg;
