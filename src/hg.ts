import _ = require('lodash');
export class Hg {
    public Log(args?: string): string {
        args = args || '';
        return `hg log ${args}`;
    }

    public ParseLog(args: string, result: string): Array<Object> {
        if (_.includes(args, '--template')) {
            return [result];
        }

        const lines: Array<string> = result.split('\n\n');
        const returnValue: Array<Object> = [];
        _(lines)
            .reject(line => !line)
            .forEach(entry => {
                const entryObject: Object = {};
                _(entry.split('\n'))
                    .forEach(line => {
                        let parts: Array<string> = line.split(':');
                        parts = _(parts)
                            .map(part => part.trim())
                            .value();


                        if (parts[0] === 'parent'
                            && entryObject.hasOwnProperty('parent')) {
                            parts[0] = 'otherBranchParent';
                        }

                        entryObject[parts[0]] = parts[1];
                        if (_.includes(parts[0], 'changeset')) {
                            // special case...
                            entryObject['hash'] = parts[2];
                        }
                    });
                returnValue.push(entryObject);
            });

        return returnValue;
    }

    public Status(args?: string): string {
        args = args || '';
        return `hg st ${args}`;
    }

    public ParseStatus(result: string): Array<Object> {
        const lines: Array<string> = result.split('\n');
        const returnValue = [];

        _(lines).forEach(line => {
            if (!line) return;
            const entry = {};
            const parts = line.split(' ');
            entry['changeType'] = parts[0];
            entry['fileName'] = parts[1];
            returnValue.push(entry);
        });

        return returnValue;
    }

    public Commit(message: string, flags?: string) {
        flags = flags || '';
        return `hg commit ${flags} -m "${message}"`;
    }

    public Diff(flags?: string): string {
        flags = flags || '';
        return `hg diff --git ${flags}`;
    }

    public Branches(flags?: string): string {
        flags = flags || '';
        return `hg branches ${flags}`;
    }

    public ParseBranches(result: string): Array<string> {
        const returnValue: Array<string> = [];
        const lines = result.split('\n');
        _(lines).forEach(line => {
            if (!line) return;
            const parts = line.split(' ');
            returnValue.push(parts[0]);
        });
        return returnValue;
    }

    public Add(fileName: string, flags?: string) {
        flags = flags || '';
        return `hg add ${fileName} ${flags}`;
    }
}
