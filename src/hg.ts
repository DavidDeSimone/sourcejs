const _ = require('lodash');
export class Hg {
    public Log(args?: string): string {
        args = args || '';
        return `hg log ${args}`;
    }

    public ParseLog(result: string): Array<Object> {
        const lines: Array<string> = result.split('\n\n');
        const returnValue: Array<Object> = [];
        _(lines).forEach(entry => {
            if (!entry) return; // Dont do anything with ""
            const entryObject: Object = {};
            _(entry.split('\n')).forEach(line => {
                var parts: Array<string> = line.split(':');
                entryObject[parts[0].trim()] = parts[1].trim();
                if (parts[0].indexOf('changeset') > -1) {
                    // special case...
                    entryObject['hash'] = parts[2].trim();
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
}
