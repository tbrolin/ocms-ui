(function () {
  var tnemucod = document.currentScript.ownerDocument,
    templates = tnemucod.querySelectorAll('template'),
    registry = {},
    ocmsui = {};

  // TODO: Get rid of unnecessary closures. - Pass the registry through the promise chain?

  function httpStatus (response) {
    // console.log('DEBUG: [httpStatus]', response);
    if (response.status >= 200 && 300 > response.status) {
      return response;
    }
    throw 'ERROR: ' + response.status;
  }

  function stringify (response) {
    // console.log('DEBUG: [stringify]');
    return response.text();
  }

  function domify (html) {
    var doc = document.implementation.createHTMLDocument('');
    doc.open();
    doc.write(html);
    doc.close();
    return doc;
  }

  function splitDom (dom) {
    return {
      'templates': Array.prototype.slice.call(dom.querySelectorAll('template')) || [],
      'scripts': Array.prototype.slice.call(dom.querySelectorAll('script')) || []
    };
  }

  function insertScripts (scriptsNtemplts) {
    scriptsNtemplts.scripts.forEach(function (script) {
      var clone = document.importNode(script, true);
      document.body.appendChild(clone);
    });
    return scriptsNtemplts;
  }

  function recordClones (scriptsNtemplts) {
    // console.log('DEBUG: [recordClones]');
    scriptsNtemplts.templates.forEach(function (template) {
      registry[template.id] = registry[template.id] || {};
      registry[template.id].promise = new Promise(function (resolve, reject) {
        registry[template.id].resolve = resolve;
        registry[template.id].reject = reject;
      });
      registry[template.id].clone = document.importNode(template.content, true);
    });
    return scriptsNtemplts;
  }

  function registerElement (scriptsNtemplts) {
    // console.log('DEBUG: [registerElement]', registry);
    var names = scriptsNtemplts.templates.map(function (template) {
        return template.id;
    });

    names.forEach(function (name) {
      registry[name].promise.then (function (record) {
        document.registerElement(name, { prototype: elementPrototype(record.clone, record.creatorFn)});
      });
      // proto = elementPrototype (record.clone, record.creatorFn);
      // document.registerElement(name, { prototype: proto });
    });
  }

  function loadComponent (path) {
    // console.log('DEBUG: [loadComponent]');
    return fetch (path)
      // fetch just fetches, we have to check status of response.
      .then (httpStatus)
      // Get the response as a string. It contains a html document.
      .then (stringify)
      // Turn the text html into an actual DOM object.
      .then (domify)
      // Extract all <template> and <script> elements from the document.
      .then (splitDom)
      // Import scripts into 'our' universe and append them to 'our' document.
      // Runs the scripts...
      .then (insertScripts)
      // Store a record in internal registry, containing all that is needed
      // to be able to create and resolve the element described by template
      // after a call to ocmsui.register().
      .then (recordClones)
      .then (registerElement)
      .catch (function (err) {
        throw 'ERROR: ' + err;
      });
  }

  // element prototype creator
  function elementPrototype (clone, creatorFn) {
    return Object.create (HTMLElement.prototype, {
      'createdCallback': {
        value: function () {
          this.shadow = this.createShadowRoot();
          this.shadow.appendChild(clone);
          //console.log('DEBUG: [createdCallback] component ', this);
          if (creatorFn) {
            //console.log('calling creatorFn');
            creatorFn.call(this, {});
          }
        }
      }
    });
  }

  ocmsui.register = function (type, name, dependencies, creatorFn) {
    // console.log('DEBUG: [ocmsui.register] ', name);
    if (registry[name] && registry[name].type) {
      console.log('WARNING: [ocms-ui.register] Component ' + name + ' already exists in registry.');
      return;
    }
    var record = registry[name] = registry[name] || {};
    record.type = type;
    record.dependencies = dependencies;
    record.creatorFn = creatorFn;
    // We have a creator!!! Go ahead and register element:
    record.resolve(record);
  };

  // Now we can create the two elements ocms-ui and ocms-import:

  recordClones ({ 'templates': Array.prototype.slice.call(templates) });

  ocmsui.register ('component', 'ocms-ui', [], function () {
    //console.log('DEBUG: [ocmsui] Register ocms-ui');
    this.ocmsUiVersion = '0.1.0';
  });

  ocmsui.register ('component', 'ocms-import', [], function () {
    //console.log('DEBUG: [ocms-import] Creator called.', this);
    var name = this.getAttribute('src'),
        path = 'components/' + name + '/' + name + '.html';
    loadComponent (path);
  });

  registerElement ({ 'templates': Array.prototype.slice.call(templates) });

  define ('ocms-ui', function () {
    return ocmsui;
  });

})();
