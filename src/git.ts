declare const module;

class Git {
    public Log(args: string): string {
        return "git log " + args;
    }

    public ParseLog(result: string): Array<Object> {
        return [
            {
                "foo": "bar"
            }
        ]
    }
}


module.exports = Git;
