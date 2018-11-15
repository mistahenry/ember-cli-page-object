import { test, module } from 'qunit';
import { create } from 'ember-cli-page-object';

module('Unit | extension and composition');

let definition = {

  foo: {

    bar: {
      baz: "prop"
    }
  }
};
let page = create(definition);

test('page objects store their definition', function(assert) {
  assert.ok(page._pageObjectDefinition);
  assert.deepEqual(page._pageObjectDefinition, definition);
});

test('page objects have an extend function', function(assert){
  assert.ok(page.extend);
  assert.equal(typeof(page.extend), "function");
});

test('page objects can be composed from other page objects', function(assert) {
  let pageComposer = create({
    somePage: page
  });
  assert.ok(pageComposer);
  assert.ok(pageComposer.somePage);
  assert.notOk(pageComposer.somePage._pageObjectDefinition, "child objects based on page objects do not store their definition");

  assert.deepEqual(pageComposer._pageObjectDefinition, {
    somePage: definition
  }, "page object definition of child object merges into parent page object's definition");
});

test('page object composition supports many levels deep', function(assert){
  let pageComposer = create({
    bar: {
      baz: page
    }
  });
  assert.ok(pageComposer);
  assert.ok(pageComposer.bar.baz);
  assert.deepEqual(pageComposer._pageObjectDefinition, {
    bar: {
      baz: definition
    }
  }, "page object definition of child object merges into parent page object's definition");
});

