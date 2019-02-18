import config from './config/environment';
import AddonDocsRouter, { docsRoute } from 'ember-cli-addon-docs/router';

const Router = AddonDocsRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  docsRoute(this, function() { 
    this.route('installation');
    this.route('quickstart');
    this.route('components');
    this.route('extend');
    this.route('migrating');
    this.route('async-await');
    this.route('native-events');
  });
  this.route('calculator');
  this.route('async-calculator');
  this.route('inputs');
  this.route('html-render');
  this.route('dynamic', { path: '/users/:user_id/comments/:comment_id' });
});

export default Router;
