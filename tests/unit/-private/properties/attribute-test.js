import { moduleForProperty } from '../../../helpers/properties';
import { create, attribute } from 'ember-cli-page-object';

moduleForProperty('attribute', function(test) {
  test('returns attribute value', async function(assert) {
    let page = create({
      foo: attribute('placeholder', ':input')
    });

    await this.adapter.createTemplate(this, page, '<input placeholder="a value">');

    assert.equal(page.foo, 'a value');
  });

  test("returns null when attribute doesn't exist", async function(assert) {
    let page = create({
      foo: attribute('placeholder', ':input')
    });

    await this.adapter.createTemplate(this, page, '<input>');

    assert.equal(page.foo, null);
  });

  test("raises an error when the element doesn't exist", async function(assert) {
    let page = create({
      foo: {
        bar: {
          baz: {
            qux: attribute('placeholder', ':input')
          }
        }
      }
    });

    await this.adapter.createTemplate(this, page);

    assert.throws(() => page.foo.bar.baz.qux, /page\.foo\.bar\.baz\.qux/);
  });

  test('looks for elements inside the scope', async function(assert) {
    let page = create({
      foo: attribute('placeholder', ':input', { scope: '.scope' })
    });

    await this.adapter.createTemplate(this, page, `
      <div><input></div>
      <div class="scope"><input placeholder="a value"></div>
      <div><input></div>
    `);

    assert.equal(page.foo, 'a value');
  });

  test("looks for elements inside page's scope", async function(assert) {
    let page = create({
      scope: '.scope',

      foo: attribute('placeholder', ':input')
    });

    await this.adapter.createTemplate(this, page, `
      <div><input></div>
      <div class="scope"><input placeholder="a value"></div>
      <div><input></div>
    `);

    assert.equal(page.foo, 'a value');
  });

  test('resets scope', async function(assert) {
    let page = create({
      scope: '.scope',

      foo: attribute('placeholder', ':input', { resetScope: true })
    });

    await this.adapter.createTemplate(this, page, `
      <div class="scope"></div>
      <div><input placeholder="a value"></div>
    `);

    assert.equal(page.foo, 'a value');
  });

  test('throws error if selector matches more than one element', async function(assert) {
    let page = create({
      foo: attribute('placeholder', ':input')
    });

    await this.adapter.createTemplate(this, page, `
      <input placeholder="a value">
      <input placeholder="other value">
    `);

    assert.throws(() => page.foo,
      /matched more than one element. If this is not an error use { multiple: true }/);
  });

  test('returns multiple values', async function(assert) {
    let page = create({
      foo: attribute('placeholder', ':input', { multiple: true })
    });

    await this.adapter.createTemplate(this, page, `
      <input placeholder="a value">
      <input placeholder="other value">
    `);

    assert.deepEqual(page.foo, ['a value', 'other value']);
  });

  test('finds element by index', async function(assert) {
    let page = create({
      foo: attribute('placeholder', ':input', { at: 1 })
    });

    await this.adapter.createTemplate(this, page, `
      <input>
      <input placeholder="a value">
    `);

    assert.equal(page.foo, 'a value');
  });

  test('looks for elements outside the testing container', async function(assert) {
    let page = create({
      foo: attribute('placeholder', ':input', { testContainer: '#alternate-ember-testing' })
    });

    await this.adapter.createTemplate(this, page, '<input placeholder="a value">', { useAlternateContainer: true });

    assert.equal(page.foo, 'a value');
  });
  test('returns attribute value when composed', async function(assert) {
    let attributePage = create({
      foo: attribute('placeholder', ':input')
    });

    let page = create({
      scope: '.container',
      input: attributePage
    })
    await this.adapter.createTemplate(this, page, '<div class="container"><input placeholder="a value"></div>');

    assert.equal(page.input.foo, 'a value');
  });
  test('returns attribute value when extended', async function(assert) {
    let attributePage = create({
      foo: attribute('placeholder', '#id1')
    });

    let page = create(attributePage.extend({
      bar: attribute('placeholder', "#someId")
    }));
    //test extended page object's attribute properties still work
    await this.adapter.createTemplate(this, page, '<input id="someId" placeholder="a value">');

    assert.equal(page.bar, 'a value');
    assert.throws(() => page.foo, /page\.foo/);
    
    //test that attribute properties created within extension overrides work properly
    await this.adapter.createTemplate(this, page, '<input id="id1" placeholder="a value">');
    assert.equal(page.foo, 'a value');
    assert.throws(() => page.bar, /page\.bar/);
  });

  test('returns attribute value when created via composition + extension', async function(assert) {
    assert.expect(1);

    const containerPage = create({
      scope: '.container'
    });
    let attributePage = create({
      foo: attribute('placeholder', ':input')
    });

    let page = create(containerPage.extend({
      input: attributePage
    }));
    await this.adapter.createTemplate(this, page, '<div class="container"><input placeholder="a value"></div>');

    assert.equal(page.input.foo, 'a value');
  });
});
