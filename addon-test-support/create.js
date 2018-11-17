import Ceibo from 'ceibo';
import { render, setContext, removeContext } from './-private/context';
import { assign } from './-private/helpers';
import { visitable } from './properties/visitable';
import dsl from './-private/dsl';
import { collection } from './properties/collection';
import $ from '-jquery';
// When running RFC268 tests, we have to play some tricks to support chaining.
// RFC268 helpers don't wait for things to settle by defaut, but return a
// promise that will resolve when everything settles. So this means
//
// page.clickOn('.foo');
// page.clickOn('.bar');
//
// will not wait after either of the clicks, whereas
//
// await page.clickOn('.foo');
// await page.clickOn('.bar');
//
// will wait after each of them. However, to preserve chaining behavior,
//
// page
//   .clickOn('.foo')
//   .clickOn('.bar');
//
// would need to wait between the clicks. However, if `clickOn()` just returned
// `page` this would be impossible because then it would be exactly the same as
// the first example, which must not wait between clicks.
//
// So the solution is to return something other than `page` from,
// `page.clickOn('.foo')`, but something that behaves just like `page` except
// waits for things to settle before invoking any async methods.
//
// To accomplish this, when building our Ceibo tree, we build a mirror copy of
// it (the "chained tree"). Anytime a chainable method is invoked, instead of
// returning the node whose method was invoked, we can return its mirror node in
// the chained tree. Then, anytime an async method is invoked on that node
// (meaning we are in a chaining scenario), the execution context can recognize
// it as a chained node and wait before invoking the target method.
//

// See https://github.com/san650/ceibo#examples for more info on how Ceibo
// builders work.

// This builder builds the primary tree
function buildObject(node, blueprintKey, blueprint, defaultBuilder) {
  blueprint = assign(assign({}, dsl), blueprint);

  return defaultBuilder(node, blueprintKey, blueprint, defaultBuilder);
}

// This builder builds the chained tree
function buildChainObject(node, blueprintKey, blueprint, defaultBuilder) {
  blueprint = assign({}, blueprint);

  return buildObject(node, blueprintKey, blueprint, defaultBuilder);
}

// recursively convert any page object child property to its definition

// since page object properties are mostly getter based, page objects retain
// a copy of their pojo definition representation to facilitate composition 
// and extension (since accessing the page object's properties during 
// extension / creation during the deep merging would fire off the getters).
export function convertPageObjectPropsToDefinitions(definition){
  Object.getOwnPropertyNames(definition).forEach(function(key){
    var property = definition[key];
    //use the definition that created the page object in place of the page object
    if(property && typeof(property) === 'object'){

      let meta = Ceibo.meta(property);
      if(meta && meta.pageObjectDefinition){
        let pageObjectDefinition = assign({}, Ceibo.meta(property).pageObjectDefinition);

        definition[key] = pageObjectDefinition;
      }
      //ignore collections since they convert page objects before storing their definitions
      else if(!property._collectionDefinition && !property._collectionScope){
        convertPageObjectPropsToDefinitions(property);
      }
    }
  });
  return definition;
}

// collections are doubly complicated. First, they contain page object-like 
// properties (ie properties created by the `create` function) that aren't truly
// user created page objects. They also rely on Ceibo's `setup` function to delay 
// the creation of the `collection` object to tree building time (rather than 
// when defined), instead returning a Ceibo descriptor during defintion time.
// They unavoidably rely on closure scoping to capture the descriptor which 
// is mutated with a `value` property. Simply storing a converted definition
// and always reinvoking the `collection` function before `create` is called 
// avoids improper shared state 
export function rescopeCollections(definition){
  Object.getOwnPropertyNames(definition).forEach(function(key){
    var property = definition[key];
    //use the definition that created the page object in place of the page object
    if(property && typeof(property) === 'object'){
      if(property._collectionDefinition && property._collectionScope){
        definition[key] = collection(property._collectionScope, rescopeCollections(property._collectionDefinition));
      }else{
        rescopeCollections(property);
      }
    }
  });
  return definition;
}

/**
 * Creates a new PageObject.
 *
 * By default, the resulting PageObject will respond to:
 *
 * - **Actions**: click, clickOn, fillIn, select
 * - **Predicates**: contains, isHidden, isPresent, isVisible
 * - **Queries**: text
 *
 * `definition` can include a key `context`, which is an
 * optional integration test `this` context.
 *
 * If a context is passed, it is used by actions, queries, etc.,
 * as the `this` in `this.$()`.
 *
 * If no context is passed, the global Ember acceptence test
 * helpers are used.
 *
 * @example
 *
 * // <div class="title">My title</div>
 *
 * import PageObject, { text } from 'ember-cli-page-object';
 *
 * const page = PageObject.create({
 *   title: text('.title')
 * });
 *
 * assert.equal(page.title, 'My title');
 *
 * @example
 *
 * // <div id="my-page">
 * //   My super text
 * //   <button>Press Me</button>
 * // </div>
 *
 * const page = PageObject.create({
 *   scope: '#my-page'
 * });
 *
 * assert.equal(page.text, 'My super text');
 * assert.ok(page.contains('super'));
 * assert.ok(page.isPresent);
 * assert.ok(page.isVisible);
 * assert.notOk(page.isHidden);
 * assert.equal(page.value, 'my input value');
 *
 * // clicks div#my-page
 * page.click();
 *
 * // clicks button
 * page.clickOn('Press Me');
 *
 * // fills an input
 * page.fillIn('name', 'John Doe');
 *
 * // selects an option
 * page.select('country', 'Uruguay');
 *
 * @example Defining path
 *
 * const usersPage = PageObject.create('/users');
 *
 * // visits user page
 * usersPage.visit();
 *
 * const userTasksPage = PageObject.create('/users/tasks', {
 *  tasks: collection({
 *    itemScope: '.tasks li',
 *    item: {}
 *  });
 * });
 *
 * // get user's tasks
 * userTasksPage.visit();
 * userTasksPage.tasks().count
 *
 * @public
 *
 * @param {Object} definition - PageObject definition
 * @param {Object} [definition.context] - A test's `this` context
 * @param {Object} options - [private] Ceibo options. Do not use!
 * @return {PageObject}
 */
export function create(definitionOrUrl, definitionOrOptions, optionsOrIsPageObject) {
  let definition;
  let url;
  let options;
  let isPageObject;
  if (typeof (definitionOrUrl) === 'string') {
    url = definitionOrUrl;
    definition = definitionOrOptions || {};
    options = optionsOrIsPageObject || {};
    isPageObject = true;
  } else {
    url = false;
    definition = definitionOrUrl;
    options = definitionOrOptions || {};
    isPageObject = (optionsOrIsPageObject !== false);
  }
  
  definition = assign({}, definition);
  if (url) {
    definition.visit = visitable(url);
  }
  
  let { context } = definition;
  delete definition.context;

  //we must replace all page objects with their definitions  
  let definitionToStore = isPageObject ? convertPageObjectPropsToDefinitions(assign({}, definition)) : definition;
  definition = assign({}, definitionToStore);
  rescopeCollections(definition);
  // Build the chained tree
  let chainedBuilder = {
    object: buildChainObject
  };
  let chainedTree = Ceibo.create(definition, assign({ builder: chainedBuilder }, options));
  // Attach it to the root in the definition of the primary tree
  definition._chainedTree = {
    isDescriptor: true,

    get() {
      return chainedTree;
    } 
  };

  // Build the primary tree
  let builder = {
    object: buildObject
  };
  
  let page = Ceibo.create(definition, assign({ builder }, options));
  if (page) {
    page.render = render;
    page.setContext = setContext;
    page.removeContext = removeContext;
    page.extend = function(opts){
      let overrides = convertPageObjectPropsToDefinitions(assign({}, opts));
      // let definitonToUseForExtension = $.extend(true, {}, definitionToStore, overrides);
      return $.extend(true, {}, definitionToStore, overrides);
    }
    
    Ceibo.meta(page).pageObjectDefinition = definitionToStore;
    
    page.setContext(context);
  }
  return page;
}
