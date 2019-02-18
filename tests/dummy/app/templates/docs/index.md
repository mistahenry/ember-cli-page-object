# So, What Is a Page Object?

One of the problems with testing a DOM is repetetive CSS selectors used to look up elements. In some cases, this repetition seems like a smell.

Sometimes DOM interactions complexity can even make it hard to remember what we were actually trying to test. This confusion can lead to difficulties updating tests and collaborating with others.

A widely used design pattern comes to the rescue: page objects. The main idea behind this pattern is to allow building convenient test interfaces for your pages and components being tested.

This addon allows you to define page objects in a declarative fashion, making it simple to model complex pages and components.

### Resources

- [Using the page object pattern with ember-cli](https://wyeworks.com/blog/2015/5/13/using-the-page-object-pattern-with-ember-cli/)
- [Martin Fowler's original description](http://martinfowler.com/bliki/PageObject.html)
- [Selenium's wiki page](https://github.com/SeleniumHQ/selenium/wiki/PageObjects)
