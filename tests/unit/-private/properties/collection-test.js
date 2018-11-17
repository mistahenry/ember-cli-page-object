import { moduleForProperty } from '../../../helpers/properties';
import { create, collection, text, hasClass } from 'ember-cli-page-object';
import withIteratorSymbolDefined from '../../../helpers/with-iterator-symbol-defined';

moduleForProperty('collection', function(test) {
  test('generates a length property', async function(assert) {
    let page = create({
      foo: collection('span')
    });

    await this.adapter.createTemplate(this, page, `
      <span>Lorem</span>
      <span>Ipsum</span>
    `);

    assert.equal(page.foo.length, 2);
  });

  test('Works with zero length', async function(assert) {
    let page = create({
      foo: collection('span')
    });

    await this.adapter.createTemplate(this, page, `
      <div>Lorem</div>
      <div>Ipsum</div>
    `);

    assert.equal(page.foo.length, 0);
  });

  test('returns an item', async function(assert) {
    let page = create({
      foo: collection('span', {
        text: text()
      })
    });

    await this.adapter.createTemplate(this, page, `
      <span>Lorem</span>
      <span>Ipsum</span>
    `);

    assert.equal(page.foo.objectAt(0).text, 'Lorem');
    assert.equal(page.foo.objectAt(1).text, 'Ipsum');
  });

  test('collects an array of items', async function(assert) {
    let page = create({
      foo: collection('span', {
        text: text()
      })
    });

    await this.adapter.createTemplate(this, page, `
      <span>Lorem</span>
      <span>Ipsum</span>
    `);

    let array = page.foo.toArray();
    assert.equal(array.length, 2);
    assert.equal(array[0].text, 'Lorem');
    assert.equal(array[1].text, 'Ipsum');

    let proxyArray = page.foo.toArray();
    assert.equal(proxyArray.length, 2);
    assert.equal(proxyArray[0].text, 'Lorem');
    assert.equal(proxyArray[1].text, 'Ipsum');
  });

  test('produces an iterator for items', async function(assert) {
    let page = create({
      foo: collection('span', {
        text: text()
      })
    });

    await this.adapter.createTemplate(this, page, `
      <span>Lorem</span>
      <span>Ipsum</span>
    `);

    let textContents = [];
    withIteratorSymbolDefined(() => {
      for (let item of page.foo) {
        textContents.push(item.text);
      }
    });

    assert.deepEqual(textContents, ['Lorem', 'Ipsum']);
  });

  test('looks for elements inside the scope', async function(assert) {
    let page = create({
      scope: '.scope',

      foo: collection('span', {
        text: text()
      })
    });

    await this.adapter.createTemplate(this, page, `
      <div>
        <span>Lorem</span>
      </div>
      <div class="scope">
        <span>Ipsum</span>
      </div>
    `);

    assert.equal(page.foo.objectAt(0).text, 'Ipsum');
  });

  test('looks for elements inside multiple scopes', async function(assert) {
    let page = create({
      scope: '.scope',

      foo: collection('li', {
        bar: {
          scope: '.another-scope',

          text: text('li', { at: 0 })
        }
      })
    });

    await this.adapter.createTemplate(this, page, `
      <ul>
        <li>Blah</li>
        <li>
          <ul class="another-scope">
            <li>Lorem<li>
          </ul>
        </li>
      </ul>
      <ul class="scope">
        <li>Ipsum</li>
        <li>
          <ul>
            <li>Dolor</li>
          </ul>
          <ul class="another-scope">
            <li>Sit</li>
            <li>Amet</li>
          </ul>
        </li>
      </ul>
    `);

    assert.equal(page.foo.objectAt(1).bar.text, 'Sit');
  });

  test('resets scope for items', async function(assert) {
    let page = create({
      scope: 'div',

      foo: collection('span', {
        resetScope: true,
        text: text()
      })
    });

    await this.adapter.createTemplate(this, page, `
      <span>Lorem</span>
      <div>
        <span>Ipsum</span>
      </div>
    `);

    assert.equal(page.foo.objectAt(0).text, 'Lorem');
  });

  test('sets correct scope to child collections', async function(assert) {
    let page = create({
      scope: '.scope',

      foo: collection('span', {
        bar: collection('em', {
          text: text()
        })
      })
    });

    await this.adapter.createTemplate(this, page, `
      <div><span><em>Lorem</em></span></div>
      <div class="scope"><span><em>Ipsum</em></span></div>
    `);

    assert.equal(page.foo.objectAt(0).bar.objectAt(0).text, 'Ipsum');
  });

  test('iterates over scoped items with a for loop', async function(assert) {
    let page = create({
      scope: 'div',
      foo: collection('span', {
        text: text()
      })
    });

    await this.adapter.createTemplate(this, page, `
      <div>
        <span>Lorem</span>
        <span>Ipsum</span>
      </div>
    `);

    let textContents = [];

    for (let i = 0; i < page.foo.length; i++) {
      let item = page.foo.objectAt(i);
      textContents.push(item.text);
    }

    assert.deepEqual(textContents, ['Lorem', 'Ipsum']);
  });

  test('iterates over scoped items with a for of loop', async function(assert) {
    let page = create({
      scope: 'div',
      foo: collection('span', {
        text: text()
      })
    });

    await this.adapter.createTemplate(this, page, `
      <div>
        <span>Lorem</span>
        <span>Ipsum</span>
      </div>
    `);

    let textContents = [];

    withIteratorSymbolDefined(() => {
      for (let item of page.foo) {
        textContents.push(item.text);
      }
    });

    assert.deepEqual(textContents, ['Lorem', 'Ipsum']);
  });

  test('iterates over scoped items with a forEach loop', async function(assert) {
    let page = create({
      scope: 'div',

      foo: collection('span', {
        text: text()
      })
    });

    await this.adapter.createTemplate(this, page, `
      <div>
        <span>Lorem</span>
        <span>Ipsum</span>
      </div>
    `);

    let textContents = [];

    page.foo.forEach((item) => {
      textContents.push(item.text);
    });

    assert.deepEqual(textContents, ['Lorem', 'Ipsum']);
  });

  test('does not mutate definition object', async function(assert) {
    let prop = text('.baz');

    let expected = {
      bar: prop,
      baz: {
        qux: prop
      }
    };

    let actual = {
      bar: prop,
      baz: {
        qux: prop
      }
    };

    let page = create({
      foo: collection('.another-scope', actual)
    });

    await this.adapter.createTemplate(this, page);

    assert.deepEqual(actual, expected);
  });

  test('looks for elements within test container specified', async function(assert) {
    assert.expect(2);

    let expectedContext = '#alternate-ember-testing';
    let page;

    page = create({
      foo: collection('span', {
        testContainer: expectedContext,
      })
    });

    await this.adapter.createTemplate(
      this,
      page,
      '<span>Lorem</span><span>ipsum</span>',
      { useAlternateContainer: true }
    );

    assert.equal(page.foo.length, 2);
    assert.equal(page.foo.objectAt(0).text, 'Lorem');
  });

  test('objectAt returns an item', async function(assert) {
    let page = create({
      foo: collection('span', {
        text: text()
      })
    });

    await this.adapter.createTemplate(this, page, `
      <span>Lorem</span>
      <span>Ipsum</span>
    `);

    assert.equal(page.foo.objectAt(0).text, 'Lorem');
    assert.equal(page.foo.objectAt(1).text, 'Ipsum');
  });

  test('forEach works correctly', async function(assert) {
    let page = create({
      foo: collection('span', {
        text: text()
      })
    });

    await this.adapter.createTemplate(this, page, `
      <span class="special">Lorem</span>
      <span>Ipsum</span>
    `);

    let textArray = [];
    page.foo.forEach((i) => {
      textArray.push(i.text);
    });

    assert.deepEqual(textArray, ['Lorem', 'Ipsum']);
  });

  test('map works correctly', async function(assert) {
    let page = create({
      foo: collection('span', {
        text: text()
      })
    });

    await this.adapter.createTemplate(this, page, `
      <span>Lorem</span>
      <span>Ipsum</span>
    `);

    assert.deepEqual(page.foo.map((i) => i.text), ['Lorem', 'Ipsum']);
  });

  test('mapBy works correctly', async function(assert) {
    let page = create({
      foo: collection('span', {
        text: text()
      })
    });

    await this.adapter.createTemplate(this, page, `
      <span>Lorem</span>
      <span>Ipsum</span>
    `);

    assert.deepEqual(page.foo.mapBy('text'), ['Lorem', 'Ipsum']);
  });

  test('filter works correctly', async function(assert) {
    let page = create({
      foo: collection('span', {
        isSpecial: hasClass('special'),
        text: text()
      })
    });

    await this.adapter.createTemplate(this, page, `
      <span class="special">Lorem</span>
      <span>Ipsum</span>
    `);

    assert.deepEqual(page.foo.filter((i) => i.isSpecial).map((i) => i.text), ['Lorem']);
    assert.deepEqual(page.foo.filter((i) => i.isFoo).map((i) => i.text), []);
  });

  test('filterBy works correctly', async function(assert) {
    let page = create({
      foo: collection('span', {
        isSpecial: hasClass('special'),
        text: text()
      })
    });

    await this.adapter.createTemplate(this, page, `
      <span class="special">Lorem</span>
      <span>Ipsum</span>
    `);

    assert.deepEqual(page.foo.filterBy('isSpecial').map((i) => i.text), ['Lorem']);
    assert.deepEqual(page.foo.filterBy('isFoo').map((i) => i.text), []);
  });

  test('uses array accessor', async function(assert) {
    let page = create({
      foo: collection('span')
    });

    await this.adapter.createTemplate(this, page, `
      <span>Lorem</span>
      <span>Ipsum</span>
    `);

    assert.equal(page.foo[0].text, 'Lorem');
    assert.equal(page.foo[1].text, 'Ipsum');
  });
  test('returns an item when composed', async function(assert) {

    let collectionPage = create({
      foo: collection('span', {
        text: text()
      })
    });

    let page = create({
      scope: '.container',
      collectionPage: collectionPage
    })
    await this.adapter.createTemplate(this, page, `
      <div class="container">
        <span>Lorem</span>
        <span>Ipsum</span>
      </div>
    `);
    assert.equal(page.collectionPage.foo.objectAt(0).text, 'Lorem');
    assert.equal(page.collectionPage.foo.objectAt(1).text, 'Ipsum');
  });

  test('returns an item when extended', async function(assert) {
    let collectionPage = create({
      foo: collection('span', {
        text: text()
      })
    });

    let page = create(collectionPage.extend({
      // setDebugMe: true,
      bar: collection(".someClass", {
        text: text()
      })
    }));

    await this.adapter.createTemplate(this, page, `
      <span>Lorem</span>
      <span>Ipsum</span>
    `);
    
    assert.equal(page.foo.objectAt(0).text, 'Lorem');
    assert.equal(page.foo.objectAt(1).text, 'Ipsum');
    assert.equal(page.bar.length, 0);

    await this.adapter.createTemplate(this, page, `
      <div class="someClass">Lorem</div>
      <div class="someClass">Ipsum</div>
    `);
    assert.equal(page.bar.objectAt(0).text, 'Lorem');
    assert.equal(page.bar.objectAt(1).text, 'Ipsum');
    assert.equal(page.foo.length, 0);
  });

  test('returns an item when page object with nested collection is extended', async function(assert) {
    let collectionPage = create({
      foo: collection('.container', {
        bar: collection(".someClass", {
          text: text()
        })
      })
    });

    let page = create(collectionPage.extend({
      bar: collection(".someClass", {
        text: text()
      })
    }));

    await this.adapter.createTemplate(this, page, `
      <div class="container">
        <span class="someClass">Lorem</span>
      </div>
      <div class="container">
        <span class="someClass">foo</span>
        <span class="someClass">bar</span>
      </div>
    `);
    assert.equal(page.foo.objectAt(0).bar.objectAt(0).text, 'Lorem');
    assert.equal(page.foo.objectAt(1).bar.objectAt(1).text, 'bar');
    assert.equal(page.bar.objectAt(2).text, 'bar');
  });

  test('returns an item when created via composition + extension', async function(assert) {
    const containerPage = create({
      scope: '.container'
    });
    let collectionPage = create({
      foo: collection('span', {
        text: text()
      })
    });

    let page = create(containerPage.extend({
      collectionPage: collectionPage
    }));
    await this.adapter.createTemplate(this, page, `
      <div class="container">
        <span>Lorem</span>
        <span>Ipsum</span>
      </div>
    `);

    assert.equal(page.collectionPage.foo.objectAt(0).text, 'Lorem');
    assert.equal(page.collectionPage.foo.objectAt(1).text, 'Ipsum');
  });

  test('returns an item when created with page object as definition', async function(assert){
    const textPage = create({
      spanText: text("span")
    });
    let page = create({
      scope: '.container',
      collection: collection("li", textPage)
    });

    await this.adapter.createTemplate(this, page, `
      <ul class="container">
        <li>Text <span>Lorem</span></li>
        <li>Text <span>Ipsum</span><>li<
      <ul>
    `);

    assert.equal(page.collection.objectAt(0).spanText, 'Lorem');
    assert.equal(page.collection.objectAt(1).spanText, 'Ipsum');
  });

  test('returns an item when collection definition contains page object', async function(assert){
    const textPage = create({
      spanText: text("span")
    });
    let page = create({
      scope: '.container',
      collection: collection("li", {
        textPage: textPage
      })
    });
    await this.adapter.createTemplate(this, page, `
      <ul class="container">
        <li>Text <span>Lorem</span></li>
        <li>Text <span>Ipsum</span><>li<
      <ul>
    `);

    assert.equal(page.collection.objectAt(0).textPage.spanText, 'Lorem');
    assert.equal(page.collection.objectAt(1).textPage.spanText, 'Ipsum');
  });
});
