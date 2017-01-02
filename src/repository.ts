declare const GitGraph;
import _ = require('lodash');
import Promise = require('bluebird');

export module Repository {
    const exec = require('child_process').exec;

    export class Hg {
        constructor(public fullPath: string) {
        }

        private _exec(command: string): any {
            return new Promise((resolve, reject) => {
                exec(command, { cwd: this.fullPath }, (error, stdout, stderr) => {
                    if (error) {
                        reject({ error, stdout, stderr });
                    } else {
                        resolve(stdout);
                    }
                })
            });
        }

        public Status(args?: string): Promise<Array<Object>> {
            return this._exec(`hg st ${args || ''}`)
                .then(this.parseStatus.bind(this));
        }
        public Log(args?: string): Promise<Array<Object>> {
            return this._exec(`hg log ${args || ''}`)
                .then(this.parseLog.bind(this, args || ''));
        }

        public Commit(message: string, flags?: string): Promise<string> {
            return this._exec(`hg commit ${flags || ''} -m "${message}"`);
        }

        public Diff(flags?: string): Promise<string> {
            return this._exec(`hg diff --git ${flags || ''}`);
        }

        public Branches(flags?: string): Promise<Array<string>> {
            return this._exec(`hg branches ${flags || ''}`)
                .then(this.parseBranches.bind(this));
        }

        public Add(fileName: string, flags?: string) {
            return this._exec(`hg add ${fileName} ${flags || ''}`);
        }

        public Remove(fileName: string, flags?: string): Promise<void> {
            return this._exec(`hg rm ${fileName} ${flags || ''}`);
        }

        public Update(rev: string, flags?: string): Promise<string> {
            return this._exec(`hg update ${flags || ''} ${rev}`);
        }

        public Id(flags?: string): Promise<string> {
            return this._exec(`hg id ${flags || ''}`);
        }

        private parseStatus(result: string): Array<Object> {
            const lines: Array<string> = result.split('\n');
            const returnValue = [];

            _(lines)
                .reject(line => !line)
                .forEach(line => {
                    const parts = line.split(' ');
                    returnValue.push({
                        changeType: parts[0],
                        fileName: parts[1]
                    });
                });

            return returnValue;
        }

        private parseLog(args: string, result: string): Array<Object> {
            if (_.includes(args, '--template')) {
                return [result];
            }

            const lines: Array<string> = result.split('\n\n');
            const returnValue: Array<Object> = [];
            _(lines)
                .reject(line => !line)
                .forEach(entry => {
                    const entryObject: Object = {};

                    // We expect our data to look like 
                    // "key: value"
                    // We will split according to newline,
                    // and enter these key/value pairs into our entry object.
                    // we have to handle some special cases
                    // If we are dealing with a merge commit, we have two parent commits
                    // and if we have a changeset, map it to hash for convience in our UI view
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

        public parseBranches(result: string): Array<string> {
            return _(result.split('\n'))
                .reject(line => !line)
                .map(line => line.split(' ')[0])
                .value();
        }
    }
}
