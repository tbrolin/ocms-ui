(function (backend) {

  var configurations = {}, etags = {}, http = {};

  backend.BackendService =
  ng.core.Injectable({ })
  .Class({
    constructor: [ng.http.Http, function BackendService (Http) {

      http = Http;

      this.operation = {
        SET_ALIAS_OPERATION: "atex.operation.SetAlias",
        ASSIGN_TO_VIEWS_OPERATION: "atex.operation.AssignToViews",
        ASSIGN_TO_SYMBOLIC_VIEWS: "atex.operation.AssignToSymbolicViews"
      };

      this.configure ('default', {
        'url': 'http://lvh.me:8080/ace',
        'user': {},
        'variant': '',
        'search': {
          'index': 'public'
        }
      });

    }],
    configure: function configure (name, settings) {
      return _configure.call (this, name, settings);
    },
    authenticate: function authenticate (name, password) {
      var self = this, conf = configurations[self.activeConf];
      return Promise.resolve (_buildAuthenticationRequest.call (this, name, password))
      .then (_doRequest)
      .then (_parseResponse)
      .then (function (resp) {
        conf.user = resp;
        return resp;
      })
      .catch (_handleError);
    },
    isAuthenticated: function isAuthenticated () {
      return Promise.resolve(true);
    },
    invalidateAuthentication: function invalidateAuthentication () {
      console.warn ('Operation %s not implemented', 'invalidateAuthentication');
      return Promise.reject({
        'status': 'ERROR',
        'cause': 'NOT_IMPLEMENTED'
      });
    },
    renewAuthentication: function renewAuthentication () {
      console.log ('Operation %s not implemented', 'renewAuthentication');
      return Promise.reject({
        'status': 'ERROR',
        'cause': 'NOT_IMPLEMENTED'
      });
    },
    create: function create (body, operations) {
      /*  return Promise.resolve (_buildCreateRequest (body, operations))
      .then (doRequest)
      .then (parseResponse)
      .catch (handleError); */

      return Promise.resolve({ 'id': 'createtid', 'data': JSON.parse(JSON.stringify(body.data)) });
    },
    read: function read (opts, variant) {
      /*  return _buildReadRequest(opts, variant)
      .then (doRequest)
      .then (parseResponse)
      .catch (handleError); */
      return Promise.resolve({ 'id': 'readid', 'data': { 'aspects': { 'contentData': 'Read this content from backend.' }}});
    },
    update: function update (body, operations) {
      /*  return _buildUpdateRequest(body, operations)
      .then (doRequest)
      .then (parseResponse)
      .catch (handleError); */
      return Promise.resolve({ 'id': 'updateid', 'data': JSON.parse(JSON.stringify(body.data)) });
    },
    delete: function delete_ (opts) {
      /*  return _buildDeleteRequest(opts)
      .then (doRequest)
      .then (parseResponse)
      .catch (handleError); */
      return Promise.resolve({ 'id': 'deleteid', 'data': JSON.parse(JSON.stringify(body.data)) });
    },

    // Div api
    type: function (typename, recursive) {
      return Promise.reject({
        'status': 'ERROR',
        'cause': 'NOT_IMPLEMENTED'
      });
    },
    history: function (alias) {
      return Promise.reject({
        'status': 'ERROR',
        'cause': 'NOT_IMPLEMENTED'
      });
    },
    search: function (core, opts, variant) {
      return Promise.reject({
        'status': 'ERROR',
        'cause': 'NOT_IMPLEMENTED'
      });
    },
    userSearch: function (query) {
      // console.log('DEBUG: userSearch', query);
      return Promise.resolve (_buildUserSearchRequest.call (this, query))
      .then (_doRequest)
      .then (_parseResponse)
      .catch (_handleError);
    },
    saveState: function () {
      window.localStorage.setItem ('backendServiceState', JSON.stringify(configurations));
    },
    restoreState: function () {
      var storedBackendServiceState = window.localStorage.getItem ('backendServiceState');
      if (storedBackendServiceState) {
        storedBackendServiceState = JSON.parse(storedBackendServiceState);
      }
      configurations = storedBackendServiceState || configurations;
    }
  });


  // ** Configure ***
  function _configure (name, settings) {
    if (!name || _.isObject (name) || _.isFunction (name)) {
      settings = name;
      name = this.activeConf;
    }

    if (_.isFunction (settings)) {
      return this.configure (name, settings());
    }

    // TODO: This could be done better... Overwrites the configuration completely
    if (_.isObject(settings)) {
      configurations[name] = _.extend ({}, configurations[name], settings);
      configurations[name].urls = _urlBuild (configurations[name].url);
    }

    this.activeConf = configurations[name] ? name : this.activeConf;

    return JSON.parse(JSON.stringify(configurations[this.activeConf]));
  }

  function _urlBuild (baseUrl) {
    baseUrl = ('' + baseUrl).replace (/\/+$/, "");
    return {
      'auth':       baseUrl + '/security/token',
      'content':    baseUrl + '/content',
      'get':        baseUrl + '/content/alias',
      'delete':     baseUrl + '/content/alias',
      'getVersion': baseUrl + '/content/version',
      'put':        baseUrl + '/content/alias',
      'post':       baseUrl + '/content',
      'view':       baseUrl + '/content/view',
      'search':     baseUrl + '/search',
      'userSearch': baseUrl + '/security/user/search',
      'type':       baseUrl + '/type'
    };
  }

  function _buildAuthenticationRequest (username, password) {
    var conf = configurations[this.activeConf];
    return {
      'url' : conf.urls.auth,
      'method': 'POST',
      'body': { 'username': username, 'password': password }
    };
  }

  function _buildUserSearchRequest (query) {
    // console.log('DEBUG: _buildUserSearchRequest', query);
    var conf = configurations[this.activeConf];

    return {
      'url': conf.urls.userSearch,
      'method': 'GET',
      'params': { 'query': query },
      'headers': { 'x-auth-token': conf.user.token }
    };
  }

  function _querystring (params) {
    var str = [];
    for(var p in params)
    if (params.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]));
    }
    return str.join("&");
  }

  function _doRequest (opts) {

    var fetchopts = {
      'method': opts.method || 'GET',
      'url': opts.params ? opts.url + '?' + _querystring (opts.params) : opts.url,
      'headers': opts.headers || {}
    };

    if (opts.body) {
      fetchopts.body = JSON.stringify (opts.body);
    }

    fetchopts.headers['content-type'] = fetchopts.headers['content-type'] || 'application/json';
    // console.log('DEBUG: Before request init');
    request = new ng.http.Request(new ng.http.RequestOptions(fetchopts));
    //  console.log('DEBUG: After request init');
    // console.log('DEBUG: _doRequest', request);

    return http.request (request).toPromise();
  }

  function _parseResponse (response) {
    // console.log('DEBUG: _parseResponse', response);
    switch (response.status) {
      case 400:
      case 401:
      case 403:
      case 404:
      case 409:
      case 500:
      return response.json().then (function (err) { return Promise.reject (err.json()); }); break;
      case 200:
      case 201:
      case 204:
      case 304:
      if (!response.headers.get('content-type')) {
        return;
      }
      return response.json(); break;
      default: return response;
    }
  }

  function _handleError (error) {
    return Promise.reject(error);
  }
  /*
  return response.json().then(function (content) {
  if (response.headers.get('etag')) {
  self.etags[content.id] = self.etags[content.id] || {};
  self.etags[content.id]['latest'] = self.etags[content.id][content.version] = response.headers.get('etag');

}*/

})(window.backend || (window.backend = {}));
