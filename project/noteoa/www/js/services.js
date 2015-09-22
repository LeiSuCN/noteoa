top.window.MWCONFIG = top.window.MWCONFIG || {
  //server: 'http://192.168.1.19:84'
  server: 'http://mwnboy.mailworld.org'
}

angular.module('mwnoteoa.services', [])

// 任务管理
.factory('Task', function($http){

  //
  console.log( 'mwnoteoa.services.Task service is initializing...' );

  var dataUrlMissionListToday = '/index.php?r=mission/getlist-today'
  var dataUrlUpdateStore = '/index.php?r=mission/updstore'
  var dataUrlAddStore = '/index.php?r=mission/addstore'
  var dataUrlFinish = '/index.php?r=mission/finished'; // 完成任务
  var dataUrlCreateQuestion = '/index.php?r=question/build'; // 创建问题

  // 内部变量，用来在controller中共享变量
  var _shares = {};
  var _todayTasks = [];
  var _todayTasksView = false;

  var taskTypes = {
    '0': {
      name: '拓展',
      id: '0'
    },
    '1': {
      name: '维护',
      id: '1'
    }
  }

  function setTodayTasksView( viewFunc ){
    _todayTasksView = viewFunc;
  }

  // 获取任务列表
  // @param boy 猫屋男孩
  // @param time 任务创立的时间
  function getTodayTasks(params, callback){

    _todayTasks.length = 0;

    $http.post( MWCONFIG.server + dataUrlMissionListToday, params )
    .then(
      function( resp ){
        if( resp.status == 200 && resp.data){
          angular.forEach(resp.data, function(task){
            _todayTasks.push( task );
          })
        }

        // 更新视图
        if( _todayTasksView ){
          _todayTasksView( _todayTasks );
        }

        // 回调结果
        if( callback )
          callback( _todayTasks );
      },
      function( resp ){ console.error( resp ) }
    );
  }

  // 获取任务列表,必须先执行getTodayTasks
  // @param taskId 任务ID
  function getTodayTask(taskId){
    var result;
    angular.forEach(_todayTasks,function(task){
      if( taskId == task.id ){
        result = task;
      }
    });
    
    return result;
  }

  // 创建任务
  function createTask(task, callback){

    var url = MWCONFIG.server;
    if( task.type == '0' ){
      url += dataUrlAddStore;
    } else if( task.type == '1' ){
      url += dataUrlUpdateStore;
    } else{
      return; //TODO
    }

    $http.post( url, task )
    .then(
      function( resp ){

        // 缓存查询结果
        var status = resp.status;
  
        if( resp.status == 200 && resp.data){
          //
        }
        // 回调结果
        callback( resp );
      },
      function( resp ){ console.error( resp ) }
    );

  }

  // 更新任务
  function updateTask(task, callback){
    $http.post( MWCONFIG.server + dataUrlFinish, task )
    .then(
      function( resp ){
  
        if( resp.status == 200 && resp.data){
          //
        }
        // 回调结果
        callback( resp );
      },
      function( resp ){ console.error( resp ) }
    );
  }

  // 创建问题
  function createQuestion(question, callback){

    var url = MWCONFIG.server + dataUrlCreateQuestion;

    $http.post( url, question )
    .then(
      function( resp ){

        // 缓存查询结果
        var status = resp.status;
  
        if( resp.status == 200 && resp.data){
          //
        }
        // 回调结果
        callback( resp );
      },
      function( resp ){ console.error( resp ) }
    );

  }

  // 设置共享变量
  function setShareValue( name, value ){
    _shares[name] = value;
  }

  // 获取共享变量
  function getShareValue( name ){
    return _shares[name];
  }

  return {
    taskTypes:taskTypes,
    setShareValue: setShareValue,
    getShareValue: getShareValue,
    getTodayTasks: getTodayTasks,
    getTodayTask: getTodayTask,
    createTask: createTask,
    updateTask: updateTask,
    createQuestion: createQuestion,
    setTodayTasksView: setTodayTasksView
  }

})

// 门店管理
.factory('Store', function($http){

  //
  console.log( 'mwnoteoa.services.Store service is initializing...' );

  var dataUrlList = '/index.php?r=store/getlist';

  var dataUrlUpdateStore = '/index.php?r=store/toupdate'


  var _cache_all_stores = false; // 缓存全部门店数据
  var _cache_stores = false; // 缓存数据 


  function search( params, callback ){

    _cache_stores = {}; // 清空缓存

    var url = MWCONFIG.server + dataUrlList;

    $http.post( url, params )
    .then(
      function( resp ){

        // 缓存查询结果
        var status = resp.status;
  
        if( resp.status == 200 && resp.data){
          var stores = resp.data;
          angular.forEach(stores, function(store,key){
            // store_id -> store
            _cache_stores[ store.id ] = store;
          });
        }
        // 回调结果
        callback( _cache_stores );
      },
      function( resp ){
        console.log( resp )
      }
    );
  }

  // 获取全部门店信息
  function getAll(params, callback){

    // 先从缓存中获取
    if( _cache_all_stores ){
      callback( _cache_all_stores );
      return;
    }

    $http.post( MWCONFIG.server + dataUrlList, params )
    .then(
      function( resp ){

        // 缓存查询结果
        var status = resp.status;
  
        if( resp.status == 200 && resp.data){
          _cache_all_stores = resp.data;
        }
        // 回调结果
        callback( _cache_all_stores );
      },
      function( resp ){
        console.log( resp )
      }
    );
  }

  // 只获取一个门店信息
  function getOne(storeId, callback){

    // 先从缓存中获取
    var store = _cache_stores[storeId]; 
    if( store ){
      callback( store );
    }
  }

  // 保存门店信息
  function updateOne( store, callback ){

    var url = MWCONFIG.server + dataUrlUpdateStore;

    console.log( url )
    $http.post(url, store )
    .then(
      function(resp){

        // 更新成功需要更新缓存
        if( resp.status == 200 ){
          var cacheStore = _cache_stores[store.storeId];
          if( cacheStore ){
            angular.forEach(store, function( value, name){
              if( name != 'storeId' ){
                cacheStore[name] = value;
              }
            });
          }
        }

        if( callback ) callback( resp );
      } , 
      function(resp){
        console.error( resp )
      }
    );
  }

  return {
    search: search,
    getOne: getOne,
    getAll: getAll,
    updateOne: updateOne
  }

})

// 个人管理
.factory('User', function($http){

  var api = {};

  var _me = {
      id: 3,
      name: '宿磊',
      phone: '18124632649'
  }

  api.me = function(){
    return _me;
  }


  return api;
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
