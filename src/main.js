(function (app) {
  document.addEventListener ('DOMContentLoaded', function () {

    ng.platformBrowserDynamic
      .platformBrowserDynamic ()
      .bootstrapModule (app.AdminModule)
      .then(function (platformRef) {

        /*app.UpgradeModule = platformRef.injector.get(ng.upgrade.static.UpgradeModule);
        angular.module('ui-admin', ['atex.onecms.service'])
        .directive('adminComponent', ng.upgrade.static.downgradeComponent(app.AdminComponent));
        app.UpgradeModule.bootstrap(document.body, ['ui-admin'], { strictDi : true });*/

      });
  });
})(window.app || (window.app = {}));
