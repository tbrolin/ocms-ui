# Web components

1. `<link rel="import" href="imported.html">`

2. `document.registerElement(name, options)`

  example:

  ```
  // default:
  var MyElement = document.registerElement('my-element');
  // equivalent to:
  // document.registerElement('my-element', {
  //  'prototype': HTMLElement.prototype
  // });

  var myElement = new MyElement();
  document.appendChild(myElement);

  // but it doesn't stop there:

  var MyCoolElement = document.registerElement('my-cool-element', {
      'prototype': Object.create(HTMLElement.prototype, {
          
        });
    });

  ```
  https://developer.mozilla.org/en-US/docs/Web/API/Document/registerElement

3. `<template>` element
   holds html not rendered.
