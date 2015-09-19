// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('mwnoteoa', ['ionic', 'mwnoteoa.controllers', 'mwnoteoa.services', 'mwnoteoa.filters'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

    // 全局配置
    window.MWCONFIG = window.MWCONFIG || {
      server: 'http://192.168.1.19:84'
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abract state stfor the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })
  .state('tab.task', { // 任务管理
    url: '/task',
    views: {
      'tab-task': {
        templateUrl: 'templates/tab-task.html',
        controller: 'TaskCtrl'
      }
    }
  })
  .state('tab.task-detail', { // 任务详情
    url: '/task/:taskId',
    views: {
      'tab-task': {
        templateUrl: 'templates/tab-task-detail.html',
        controller: 'TaskDetailCtrl'
      }
    }
  })
  .state('tab.store', { // 门店查询
    url: '/store',
    views: {
      'tab-store': {
        templateUrl: 'templates/tab-store.html',
        controller: 'StoreCtrl'
      }
    }
  })
  .state('tab.store-detail', { // 门店查询－详情
    url: '/store/:storeId',
    views: {
      'tab-store': {
        templateUrl: 'templates/tab-store-detail.html',
        controller: 'StoreDetailCtrl'
      }
    }
  })
  .state('tab.chat-setting', { // 个人中心
    url: '/setting',
    views: {
      'tab-setting': {
        templateUrl: 'templates/tab-setting.html'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/task');

  // add by sulei
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.tabs.style('standard');
  $ionicConfigProvider.navBar.alignTitle('center')
});
