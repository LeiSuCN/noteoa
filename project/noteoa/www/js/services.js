top.window.MWCONFIG = top.window.MWCONFIG || {
  //server: 'http://192.168.1.19:84'
  server: 'http://mwnboy.mailworld.org'
}

angular.module('mwnoteoa.services', [])

//
// ======== ======== ======== ========>> 本地存储 <<======== ======== ======== ========
//
.factory('MwStorage', function($window) {

  console.log( 'mwnoteoa.services.MwStorage service is initializing...' );

  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
})

//
// ======== ======== ======== ========>> 任务管理 <<======== ======== ======== ========
//
.factory('Task', function($http, MwStorage){

  //
  console.log( 'mwnoteoa.services.Task service is initializing...' );

  var dataUrlMissionListToday = '/index.php?r=mission/getlist-today'
  var dataUrlMissionListDel = '/index.php?r=mission/cancel'
  var dataUrlUpdateStore = '/index.php?r=mission/updstore'
  var dataUrlAddStore = '/index.php?r=mission/addstore'
  var dataUrlFinish = '/index.php?r=mission/finished'; // 完成任务
  var dataUrlCreateQuestion = '/index.php?r=question/build'; // 创建问题
  var dataUrlGetQuestion = '/index.php?r=question/getlist'; // 查询问题

  var dataUrlUpdateRecord = '/index.php?r=record/toupdate'; // 更新工作日志

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

  function postAndCallback( url, params, callback ){
    $http.post( url, params )
    .then(
      function( resp ){
        // 回调结果
        if( callback )
          callback( resp.status, resp.statusText, resp.data );
      },
      function( resp ){ console.error( resp ) }
    );
  }

  function setTodayTasksView( viewFunc ){
    _todayTasksView = viewFunc;
  }

  // 获取任务列表
  // @param boy 猫屋男孩
  // @param time 任务创立的时间
  function getTodayTasks(params, callback){

    // 清空任务数据 
    _todayTasks.length = 0;

    $http.post( MWCONFIG.server + dataUrlMissionListToday, params )
    .then(
      function( resp ){
        if( resp.status == 200 && resp.data){
          angular.forEach(resp.data, function(task){
            _todayTasks.push( task );
          })
        }

        // 更新视图 ugly!!!
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
    } else if( task.type == '9' ){
      url += dataUrlMissionListDel;
    } else{
      return;
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

  // 更新问题记录
  function updateRecord(record, callback){
    postAndCallback(MWCONFIG.server + dataUrlUpdateRecord, record, callback);
  }

  // 创建问题
  function createQuestion(question, callback){
    postAndCallback(MWCONFIG.server + dataUrlCreateQuestion, question, callback);
  }
  
  // 查询问题
  function getQuestions(params, callback){

    postAndCallback(MWCONFIG.server + dataUrlGetQuestion, params, callback)

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
    getQuestions: getQuestions,
    updateRecord: updateRecord,
    setTodayTasksView: setTodayTasksView
  }

})

//
// ======== ======== ======== ========>> 门店管理 <<======== ======== ======== ========
//
.factory('Store', function($http){

  var share = {};

  //
  console.log( 'mwnoteoa.services.Store service is initializing...' );

  var dataUrlList = '/index.php?r=store/getlist';

  var dataUrlUpdateStore = '/index.php?r=store/toupdate'


  var _cache_all_stores = false; // 缓存全部门店数据
  var _cache_stores = false; // 缓存数据 


  /*
   * post请求 
   */
  function postAndCallback( url, params, callback ){
    $http.post( url, params )
    .then(
      function( resp ){
        // 回调结果
        if( callback )
          callback( resp.status, resp.statusText, resp.data );
      },
      function( resp ){ console.error( resp ) }
    );
  }


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

  /*
   * 只获取一个门店信息
   * @param storeId  门店ID 
   * @param callback 回调函数
   * @param force    是否强迫刷新
   */ 
  function getOne(storeId, callback, force){

    // 非强迫刷新时，先尝试从缓存中获取
    if( !force ){
      var store = _cache_stores[storeId]; 
      if( store ){
        callback( store );
        return;
      }
    }

    postAndCallback( MWCONFIG.server + dataUrlList, {leaguerId: storeId}, function(status, msg, data){
      callback( data )
    })
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
    share: share,
    search: search,
    getOne: getOne,
    getAll: getAll,
    updateOne: updateOne
  }

})

// 个人管理
.factory('User', function($http){

  var dataUrlLogin = '/index.php?r=handler/login';

  var api = {};

  var _me = false;

  api.me = function(){

    if( !_me ){
      _me = JSON.parse( window.localStorage['me'] || '{}' );
    }

    return _me;
  }

  api.login = function( params, callback ){
    $http.post( MWCONFIG.server + dataUrlLogin, params )
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

  api.save = function(user){
    _me = user;
    window.localStorage['me'] = JSON.stringify( user );
  }

  return api;
})
// * * * * * * * *
// 所有元数据信息
//     by sulei@2015-09-23 12:20
// * * * * * * * *
.factory('MwModel', function(){
  // 对外接口
  var api = {};

  // 任务类型
  var _taskType = { '0' : { name:'拓展', id:'0' }, '1': { name:'维护', id:'1' } };
  api.TaskType = _taskType;


  return api;
})

;
