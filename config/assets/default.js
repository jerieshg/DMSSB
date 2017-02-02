var bower_components_path = 'src/client/bower_components';

module.exports = {
  client: {
    lib: {
      js: [
        bower_components_path + '/jquery/dist/jquery.min.js',
        bower_components_path + '/tether/dist/js/tether.min.js',
        bower_components_path + '/bootstrap/dist/js/bootstrap.min.js',
        bower_components_path + '/angular/angular.min.js',
        bower_components_path + '/angular-ui-router/release/angular-ui-router.min.js',
        bower_components_path + '/oclazyload/dist/ocLazyLoad.min.js',
        bower_components_path + '/angular-breadcrumb/dist/angular-breadcrumb.min.js',
        bower_components_path + '/angular-loading-bar/build/loading-bar.min.js',
        bower_components_path + '/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js'
      ]
    }
  },
  server: {
    gulpConfig: 'gulpfile.js',
    allJS: ['server.js', 'config/**/*.js', 'src/*/server/**/*.js'],
    models: 'src/server/models/**/*.js',
    routes: 'src/server/routes.js',
    sockets: 'src/server/sockets/**/*.js'
  }
};
