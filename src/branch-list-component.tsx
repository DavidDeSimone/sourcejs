import { Repository } from './repository';
import _ = require('lodash');
import React = require('react');
import ReactDOM = require('react-dom');
import electron = require('electron');

export module BranchList {
    interface Props {
        repo: Repository.Hg
    }

    interface State {
        branches: Array<string>
    }


    export class Component extends React.Component<Props, State> {
        private repo: Repository.Hg
        private timerId;
        private menu: any;
        constructor(props: Props) {
            super(props);
            this.repo = props.repo;
            this.state = { branches: [] };
        }

        componentDidMount() {
            this.tick();
            this.timerId = setInterval(this.tick.bind(this), 1000);

            this.menu = new electron.remote.Menu();
            const item = new electron.remote.MenuItem({
                'label': 'test'
            });
            this.menu.append(item);
        }

        componentWillUnmount() {
            clearInterval(this.timerId);
        }

        tick() {
            this.repo.Branches()
                .then(result => {
                    this.setState({ branches: result });
                });
        }

        onContextMenu(event: any) {
            console.log('Clicked this...');
            event.preventDefault();
            this.menu.popup(event.clientX, event.clientY);
        }

        render() {
            const listItems = _(this.state.branches)
                .map(branch => {
                    return <li
                        key={branch}
                        onContextMenu={this.onContextMenu.bind(this)}
                        >{branch}</li>;
                })
                .value();
            return <div><ul>{listItems}</ul></div>;
        }
    }
}
