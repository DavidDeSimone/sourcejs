/* const React = require('react');
 * 
 * 
 * React.DOM.render(
 *     <h1> Hello React!</h1>
 * );*/


import { Hg } from './hg.js';
import { Source } from './repository.js';

let Repo = new Source.Repository<Hg>(Hg, 'path');
Repo.Log().then(console.log.bind(console));
Repo.Status('-m').then(console.log.bind(console));
Repo.Commit('"First bootrapped commit message"').then(console.log.bind(console));

