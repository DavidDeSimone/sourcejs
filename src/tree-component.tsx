declare const GitGraph;
declare const Promise;
import { Hg } from './hg.js';
import { Source } from './repository.js';
import _ = require('lodash');
import React = require('react');
import ReactDOM = require('react-dom');

export module Tree {

    require(process.cwd() + '/gitgraph.js/build/gitgraph.min.js');

    const myTemplateConfig = {
        colors: ["#F00", "#0F0", "#00F"], // branches colors, 1 per column
        branch: {
            lineWidth: 10,
            spacingX: 25,
            showLabel: true,                  // display branch names on graph
        },
        commit: {
            spacingY: -80,
            dot: {
                size: 15
            },
            message: {
                displayAuthor: true,
                displayBranch: false,
                displayHash: false,
                font: "normal 12pt Arial"
            },
            tooltipHTMLFormatter: function (commit) {
                return "" + commit.sha1 + "" + ": " + commit.message;
            }
        }
    };

    interface Props {

    }

    // @TODO update branches to be an array we iterate over
    interface State {

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
            this.state = {};
            this.graphTemplate = new GitGraph.Template(myTemplateConfig);
        }

        componentDidMount() {
            this.timerId = setInterval(() => this.tick(), 1000);
        }

        componentWillUnmount() {
            clearInterval(this.timerId);
        }

        tick() {
            this.repo.Branches().then(branches => {
                _(branches).forEach(branch => {
                    const getBranchCommit = this.repo.Log(`-b ${branch}`);
                    const getParentCommit = this.repo.Log(`-r "parents(min(branch(${branch})))"`);
                    Promise.all([getBranchCommit, getParentCommit])
                        .then(result => {
                            const commits = result[0];
                            const parent = result[1];
                            const branchState = {
                                name: branch,
                                parent: parent,
                                commits: []
                            };
                            _(commits)
                                .map(commit => {
                                    return {
                                        message: commit.summary,
                                        author: commit.user,
                                        sha1: commit.hash
                                    }
                                })
                                .forEach(commit => branchState.commits.push(commit));
                            if ((!this.state[branch]) || (this.state[branch].commits[0].sha1
                                !== branchState.commits[0].sha1)) {
                                const newState = {};
                                newState[branch] = branchState;
                                this.setState(newState);
                            }
                        });
                });
            });
        }

        render() {
            if (this.renderInitalized) {
                this.graph = new GitGraph({
                    template: this.graphTemplate,
                });

                const branchMap = {};
                _(this.state).forOwn((branch, branchName) => {
                    let graphBranch = this.graph.branch(branchName);
                    branchMap[branchName] = graphBranch;
                    _(branch.commits).forEach(graphBranch.commit.bind(graphBranch));
                });
            }

            this.renderInitalized = true;
            return <canvas id="gitGraph"></canvas>;
        }
    }

}
