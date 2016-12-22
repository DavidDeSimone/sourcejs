declare const module;
const _ = require('lodash');
class Hg {
    public Log(args: string): string {
        return "hg log " + args;
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
}


module.exports = Hg;
