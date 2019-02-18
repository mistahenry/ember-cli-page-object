### EmberCLI Page Object is:
- Mostly declarative
- Quick to set up and uses convention over configuration
- Extremely easy to extend
- Unobtrusive
- Agnostic to the testing framework (but really hooked on Ember!)

```javascript
import {
  create,
  visitable,
  fillable,
  clickable,
  text
} from 'ember-cli-page-object';

const page = create({
  visit: visitable('/'),

  username: fillable('#username'),
  password: fillable('#password'),
  submit: clickable('button'),
  error: text('.errors')
});

test('my awesome test', async function(assert) {
  await page
    .visit()
    .username('admin')
    .password('invalid')
    .submit();

  assert.equal(page.error, 'Invalid credentials');
});
```