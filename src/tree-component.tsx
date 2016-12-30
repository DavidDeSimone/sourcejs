// Gitgraph will be included from a non-module require
declare const GitGraph;
declare const Promise;
import { Hg } from './hg.js';
import { Source } from './repository.js';
import _ = require('lodash');
import React = require('react');
import ReactDOM = require('react-dom');

export module Tree {

    require(process.cwd() + '/gitgraph.js/build/gitgraph.min.js');


    const currentHeadTemplate = {
        dotColor: "white",
        dotSize: 16,
        dotStrokeWidth: 16,
    };

    const myTemplateConfig = {
        colors: ["#F00", "#0F0", "#00F"], // branches colors, 1 per column
        branch: {
            lineWidth: 10,
            spacingX: 35,
            showLabel: true,                  // display branch names on graph
        },
        commit: {
            spacingY: -40,
            dot: {
                size: 10
            },
            message: {
                displayAuthor: false,
                displayBranch: false,
                displayHash: false,
                font: "normal 10pt Arial"
            },
            tooltipHTMLFormatter: function (commit) {
                return "" + commit.sha1 + "" + ": " + commit.message;
            }
        }
    };

    interface Props {

    }

    interface Commit {
        branch?: string,
        otherBranchParent?: string,
        otherBranchParentName?: string
        summary: string,
        user: string,
        hash: string
    }

    interface State {
        commits: Array<Commit>,
        currentHead: string
    }

    export class Component extends React.Component<Props, State> {
        private graph: Object;
        private repo: Source.Repository<Hg>;
        private graphTemplate: Object;
        private timerId: number;
        private renderInitalized: boolean;

        constructor(props) {
            super(props);
            this.repo = props.repo;
            this.state = { commits: [], currentHead: '' };
            this.graphTemplate = new GitGraph.Template(myTemplateConfig);
        }

        componentDidMount() {
            this.timerId = setInterval(() => this.tick(), 1000);
        }

        componentWillUnmount() {
            clearInterval(this.timerId);
        }

        tick() {
            this.repo.Id('-i')
                .then(id => {
                    if (this.state.currentHead !== id)
                        this.setState({ currentHead: id } as State);
                })
                .then(this.repo.Log.bind(this.repo))
                // Rendering can be controlled/limited by passing a '-l' flag here
                .then(commits => {
                    var lastCommit = this.state.commits[0] || { hash: 0 };
                    if (lastCommit.hash !== commits[0].hash) {
                        const parentCommitPromises = [];
                        _(commits)
                            .forEach(commit => {
                                const commitValue = commit as Commit;
                                if (commitValue.otherBranchParent
                                    && !commitValue.otherBranchParentName) {
                                    const promise = this.repo.Log(`--rev ${commitValue.otherBranchParent} --template "{branch}"`)
                                        .then((result) => {
                                            commitValue.otherBranchParentName = result[0] as string;
                                        });
                                    parentCommitPromises.push(promise);
                                }
                            });

                        Promise.all(parentCommitPromises)
                            .then(() => {
                                this.setState({
                                    commits
                                } as State);
                            });
                    }
                });
        }

        handleCommitMouseover(event: Event) {
            console.log('event');
        }

        handleCommitMousedown(commit: Commit, isOverCommit: boolean, event: MouseEvent) {
            console.log(arguments);
        }

        handleCommitDblClick(event: MouseEvent) {
            this.graph.applyCommits(event, (commit, isOverCommit, event) => {
                if (!isOverCommit) return;
                this.repo.Update(commit.sha1)
                    .catch((err) => {
                        alert(`There has been an error switching, ${err}`);
                    });
            });
        }

        render() {
            if (this.renderInitalized) {
                this.graph = new GitGraph({
                    template: this.graphTemplate,
                    orientation: "vertical-reverse",
                });

                this.graph.canvas.addEventListener("commit:mouseover",
                    this.handleCommitMouseover.bind(this));
                this.graph.canvas.addEventListener("dblclick",
                    this.handleCommitDblClick.bind(this));

                const branches = {};
                const defaultBranch = this.graph.branch('default');
                let currentBranch = defaultBranch;
                _(this.state.commits)
                    .forEachRight(commit => {
                        if (commit.branch) {
                            currentBranch = branches[commit.branch]
                                || this.graph.branch({
                                    name: commit.branch,
                                    parentBranch: currentBranch
                                });
                            branches[commit.branch] = currentBranch;
                        } else {
                            currentBranch = defaultBranch;
                        }


                        let template = null;
                        const commitDetails = {
                            message: commit.summary,
                            author: commit.user,
                            sha1: commit.hash,
                            onClick: this.handleCommitMousedown.bind(this)
                        };

                        if (this.state.currentHead.includes(commit.hash)) {
                            template = currentHeadTemplate;
                        }

                        if (commit.otherBranchParent) {
                            const branch = branches[commit.otherBranchParentName];
                            branch.merge(currentBranch, {
                                message: commit.summary,
                                author: commit.user,
                                sha1: commit.hash,
                                dotColor: "white",
                                dotSize: 8,
                                dotStrokeWidth: 8,
                                onClick: this.handleCommitMousedown.bind(this)
                            });
                        } else {
                            currentBranch.commit(_.assign(commitDetails, template));
                        }

                    });

            }

            this.renderInitalized = true;
            return <canvas id="gitGraph"></canvas>;
        }
    }
}
