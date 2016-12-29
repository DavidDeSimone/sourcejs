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
            spacingX: 35,
            showLabel: true,                  // display branch names on graph
        },
        commit: {
            spacingY: -30,
            dot: {
                size: 10
            },
            message: {
                displayAuthor: true,
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
        summary: string,
        user: string,
        hash: string
    }

    interface State {
        commits: Array<Commit>
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
            this.state = { commits: [] };
            this.graphTemplate = new GitGraph.Template(myTemplateConfig);
        }

        componentDidMount() {
            this.timerId = setInterval(() => this.tick(), 1000);
        }

        componentWillUnmount() {
            clearInterval(this.timerId);
        }

        tick() {
            // Rendering can be controlled/limited by passing a '-l' flag here
            this.repo.Log().then(commits => {
                var lastCommit = this.state.commits[0] || { hash: 0 };
                if (lastCommit.hash !== commits[0].hash) {
                    this.setState({
                        commits
                    } as State);
                }
            });
        }

        render() {
            if (this.renderInitalized) {
                this.graph = new GitGraph({
                    template: this.graphTemplate,
                    orientation: "vertical-reverse",
                });

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

                        // Use this commit config if it's a merge commit
                        /* dotColor: "white",
			 * dotSize: 8,
			 * dotStrokeWidth: 8,
			 */

                        currentBranch.commit({
                            message: commit.summary,
                            author: commit.user,
                            sha1: commit.hash,
                        });
                    });

            }

            this.renderInitalized = true;
            return <canvas id="gitGraph"></canvas>;
        }
    }
}
