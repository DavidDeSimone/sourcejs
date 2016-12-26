import { Hg } from './hg.js';
import { Source } from './repository.js';

export module Diff {
    declare const Diff2HtmlUI;
    declare const global;

    require('./node_modules/diff2html/dist/diff2html-ui.js');
    // This is gross, but the diff UI helper needs jQuery in the global namespace
    // @TODO find a better way to do this bullshit
    global.$ = require('jquery');
    let dif2html = require("diff2html").Diff2Html;
    const _ = require('lodash');
    const React = require('react');
    const ReactDOM = require('react-dom');

    export class Component extends React.Component {
        private state: Object;
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
