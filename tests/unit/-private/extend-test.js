import { test, module } from 'qunit';
import { create } from 'ember-cli-page-object';
import Ceibo from 'ceibo';

module('Unit | extension and composition');



test('page objects store their definition', function(assert) {
  let definition = {
    foo: {
      bar: {
        baz: "prop"
      }
    }
  };

  let page = create(definition);
  assert.ok(Ceibo.meta(page)._pageObjectDefinition);
  assert.deepEqual(Ceibo.meta(page)._pageObjectDefinition, definition);
});

test('page objects have an extend function', function(assert){
  let definition = {
    foo: {
      bar: {
        baz: "prop"
      }
    }
  };

  let page = create(definition);
  assert.ok(page.extend);
  assert.equal(typeof(page.extend), "function");
});

test('page objects extend function creates new defintion by overriding stored definition with new options', function(assert){
  let definition = {
    foo: {
      bar: {
        baz: "prop",
        notOverride: "still here"
      }
    }
  };

  let page = create(definition);
  let overrides = {
    foo: {
      bar: {
        baz: "changed",
        baz2: "baz2"
      }
    },
    newProp: "newProperty"
  };
  let extendedDefinition = page.extend(overrides);

  assert.deepEqual(extendedDefinition, {
    foo: {
      bar: {
        baz: "changed",
        baz2: "baz2",
        notOverride: "still here"
      }
    },
    newProp: "newProperty"
  })
});

test('page objects can be composed from other page objects', function(assert) {
  let definition = {
    foo: {
      bar: {
        baz: "prop"
      }
    }
  };

  let page = create(definition);
  let pageComposer = create({
    somePage: page
  });
  assert.ok(pageComposer);
  assert.ok(pageComposer.somePage);

  assert.notOk(Ceibo.meta(pageComposer.somePage)._pageObjectDefinition, "child objects based on page objects do not store their definition");

  assert.deepEqual(Ceibo.meta(pageComposer)._pageObjectDefinition, {
    somePage: definition
  }, "page object definition of child object merges into parent page object's definition");
});

test('page object composition supports many levels deep', function(assert){
  let definition = {
    foo: {
      bar: {
        baz: "prop"
      }
    }
  };

  let page = create(definition);
  let pageComposer = create({
    bar: {
      baz: page
    }
  });
  assert.ok(pageComposer);
  assert.ok(pageComposer.bar.baz);
  assert.deepEqual(Ceibo.meta(pageComposer)._pageObjectDefinition, {
    bar: {
      baz: definition
    }
  }, "page object definition of child object merges into parent page object's definition");
});



