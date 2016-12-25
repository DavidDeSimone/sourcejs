declare const GitGraph;
declare const Promise;
export module Source {
    const exec = require('child_process').exec;
    const _ = require('lodash');

    interface RepositoryImplementation {
        Log(args?: string): string;
        ParseLog(result: string): Array<Object>;

        Status(args?: string): string;
        ParseStatus(result: string): Array<Object>;

        Commit(message: string, flags?: string);

        Diff(flags?: string);

        Branches(flags?: string): string;
        ParseBranches(result: string): Array<string>;
    }

    export class Repository<T extends RepositoryImplementation> {
        private repo;
        private strategy: T;
        constructor(c: { new (): T; }, public fullPath: string) {
            this.strategy = new c();
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

        public Status(args?: string): PromiseLike<Array<Object>> {
            return this._exec(this.strategy.Status(args))
                .then(this.strategy.ParseStatus.bind(this.strategy));
        }
        public Log(args?: string): PromiseLike<Array<Object>> {
            return this._exec(this.strategy.Log(args))
                .then(this.strategy.ParseLog.bind(this.strategy));
        }

        public Commit(message: string, flags?: string): PromiseLike<string> {
            return this._exec(this.strategy.Commit(message, flags));
        }

        public Diff(flags?: string): PromiseLike<string> {
            return this._exec(this.strategy.Diff(flags));
        }

        public Branches(flags?: string): PromiseLike<Array<string>> {
            return this._exec(this.strategy.Branches(flags))
                .then(this.strategy.ParseBranches.bind(this.strategy));
        }
    }
}
