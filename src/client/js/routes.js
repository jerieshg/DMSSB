angular
  .module('app')
  .config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$breadcrumbProvider', function($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $breadcrumbProvider) {

    $urlRouterProvider.otherwise('/dashboard');

    $ocLazyLoadProvider.config({
      // Set to true if you want to see what and when is dynamically loaded
      debug: true
    });

    $breadcrumbProvider.setOptions({
      prefixStateName: 'app.main',
      includeAbstract: true,
      template: '<li class="breadcrumb-item" ng-repeat="step in steps" ng-class="{active: $last}" ng-switch="$last || !!step.abstract"><a ng-switch-when="false" href="{{step.ncyBreadcrumbLink}}">{{step.ncyBreadcrumbLabel}}</a><span ng-switch-when="true">{{step.ncyBreadcrumbLabel}}</span></li>'
    });

    $stateProvider
      .state('app', {
        abstract: true,
        templateUrl: 'views/common/layouts/full.html',
        //page title goes here
        ncyBreadcrumb: {
          label: 'Root',
          skip: true
        },
        resolve: {
          loadCSS: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load CSS files
            return $ocLazyLoad.load([{
              serie: true,
              name: 'Font Awesome',
              files: ['css/font-awesome.min.css']
            }, {
              serie: true,
              name: 'Simple Line Icons',
              files: ['css/simple-line-icons.css']
            }]);
          }],
          loadPlugin: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load([{
              files: [
                'js/factories/common.js'
              ]
            }]);
          }]
        }
      })
      .state('app.main', {
        url: '/dashboard',
        templateUrl: 'views/main.html',
        //page title goes here
        ncyBreadcrumb: {
          label: 'Inicio',
        },
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load controllers
            return $ocLazyLoad.load({
              files: ['js/controllers/main.js']
            });
          }]
        }
      })
      // SURVEY BUILDER RELATED
      .state('app.survey-builder', {
        url: "/survey-builder",
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
          label: 'Encuesta'
        },
        controller: 'surveyBuilderController',
        resolve: {
          loadCSS: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load CSS files
            return $ocLazyLoad.load([{
              serie: true,
              name: 'bootstrap-date-picker',
              files: ['bower_components/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css']
            }]);
          }],
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load controllers
            return $ocLazyLoad.load({
              files: ['js/controllers/survey-builder.js', 'js/survey.jquery.min.js']
            });
          }]
        }
      })
      .state('app.survey-builder.create', {
        url: '/form',
        templateUrl: 'views/components/survey-builder/surveyForm.html',
        //page title goes here
        ncyBreadcrumb: {
          label: 'Formulario',
        },
        controller: 'surveyBuilderController'
      })
      .state('app.survey-builder.edit', {
        url: '/form/:id',
        templateUrl: 'views/components/survey-builder/surveyForm.html',
        //page title goes here
        ncyBreadcrumb: {
          label: 'Formulario',
        },
        controller: 'surveyBuilderController'
      })
      .state('app.survey-builder.relations', {
        url: '/relations',
        templateUrl: 'views/components/survey-builder/surveyRelations.html',
        //page title goes here
        ncyBreadcrumb: {
          label: 'Relacione',
        },
        controller: 'surveyBuilderController'
      })
      //ADMINISTRATOR
      .state('app.admin', {
        url: "/admin",
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
          label: 'Admin'
        }
      })
      .state('app.admin.clients', {
        url: '/clientes',
        templateUrl: 'views/components/clients.html',
        ncyBreadcrumb: {
          label: 'Clientes'
        },
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load({
              files: ['js/controllers/clients.js']
            });
          }]
        }
      })
      .state('app.admin.departments', {
        url: '/departamentos',
        templateUrl: 'views/components/departments.html',
        ncyBreadcrumb: {
          label: 'Departamentos'
        },
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load({
              files: ['js/controllers/departments.js']
            });
          }]
        }
      })
      .state('app.admin.business', {
        url: '/empresas',
        templateUrl: 'views/components/business.html',
        ncyBreadcrumb: {
          label: 'Empresas'
        },
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load({
              files: ['js/controllers/business.js']
            });
          }]
        }
      })
      .state('app.admin.services', {
        url: '/service',
        templateUrl: 'views/components/services.html',
        ncyBreadcrumb: {
          label: 'Servicios'
        },
        resolve: {
          loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load({
              files: ['js/controllers/service.js']
            });
          }]
        }
      })
      //USER RELATED
      .state('app.surveys', {
        url: "/survey",
        abstract: true,
        template: '<ui-view></ui-view>',
        ncyBreadcrumb: {
          label: 'Admin'
        }
      })
      .state('app.surveys.main', {
        url: '/home',
        templateUrl: 'views/components/survey-builder/surveyForm.html',
        //page title goes here
        ncyBreadcrumb: {
          label: 'Formulario',
        },
        controller: 'surveyBuilderController'
      })
      //SIMPLE PAGES
      .state('appSimple', {
        abstract: true,
        templateUrl: 'views/common/layouts/simple.html',
        resolve: {
          loadPlugin: ['$ocLazyLoad', function($ocLazyLoad) {
            // you can lazy load files for an existing module
            return $ocLazyLoad.load([{
              serie: true,
              name: 'Font Awesome',
              files: ['css/font-awesome.min.css']
            }, {
              serie: true,
              name: 'Simple Line Icons',
              files: ['css/simple-line-icons.css']
            }]);
          }],
        }
      })

    // Additional Pages
    .state('appSimple.login', {
        url: '/login',
        templateUrl: 'views/pages/login.html'
      })
      .state('appSimple.register', {
        url: '/register',
        templateUrl: 'views/pages/register.html'
      })
      .state('appSimple.404', {
        url: '/404',
        templateUrl: 'views/pages/404.html'
      })
      .state('appSimple.500', {
        url: '/500',
        templateUrl: 'views/pages/500.html'
      })
  }]);
