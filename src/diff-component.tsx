declare const global;
declare const Diff2HtmlUI;

import { Hg } from './hg.js';
import { Source } from './repository.js';
import HtmlDiff = require("diff2html");
import _ = require('lodash');
import React = require('react');
import ReactDOM = require('react-dom');

export module Diff {

    // This is gross, but the diff UI helper needs jQuery in the global namespace
    // @TODO find a better way to do this bullshit
    global.$ = require('jquery');
    const Diff2Html = HtmlDiff.Diff2Html;
    require(process.cwd() + '/node_modules/diff2html/dist/diff2html-ui.js');

    interface Props {

    }

    interface State {
        diff: string
    }

    export class Component extends React.Component<Props, State> {
        private timerId;
        private repo: Source.Repository<Hg>;
        constructor(props) {
            super(props);
            this.repo = props.repo;
            this.state = { diff: '' };
        }

        tick() {
            this.repo.Diff().then(result => {
                this.setState({
                    diff: result
                });
            });
        }

        componentDidMount() {
            this.tick();
            this.timerId = setInterval(() => this.tick(), 1000);
        }

        componentWillUnmount() {
            clearInterval(this.timerId);
        }

        render() {
            if (this.state.diff) {
                const diffView = new Diff2HtmlUI({ diff: this.state.diff });
                diffView.draw('#diffView', { inputFormat: 'diff', showFiles: true, matching: 'lines' });
                diffView.highlightCode('#line-by-line');
            } else {
                var element = document.getElementById('diffView');
                if (element) element.innerHTML = '';
            }
            return (
                <div id="diffView"></div>
            );
        }
    }
}
