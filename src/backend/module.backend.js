(function (backend) {

  backend.BackendModule =
    ng.core.NgModule({
      imports: [ng.http.HttpModule],
      declarations: [],
      provide: [backend.BackendService, ng.http.Http]
    })
    .Class({
      constructor: function BackendModule () { }
    });
})(window.backend || (window.backend = {}));
