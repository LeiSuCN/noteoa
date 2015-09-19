angular.module('mwnoteoa.services', [])

// 任务管理
.factory('Task', function(){

  //
  console.log( 'mwnoteoa.services.Task service is initializing...' );

  var TASK_TYPE = {
    1: {
      name: '拓展'
    },
    2: {
      name: '维护'
    }
  }

  // 根据任务类型ID获取任务
  // @param iType 任务类型
  function getTaskByType( iType ){
    return TASK_TYPE[iType];
  }


  // 获取任务列表
  // @param boy 猫屋男孩
  // @param time 任务创立的时间
  function getTasks(boy, time){

    return [
      { id:'A001', type:1, total:2, done:2 },
      { id:'A002', type:2, total:3, done:1 }
    ];

  }

  return {
    getTasks: getTasks,
    getTaskByType: getTaskByType
  }

})

// 门店管理
.factory('Store', function($http){

  //
  console.log( 'mwnoteoa.services.Store service is initializing...' );

  var dataUrlList = '/index.php?r=store/getlist';

  var dataUrlUpdateStore = '/index.php?r=store/toupdate'


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
        callback( resp );
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
        console.log( resp )
      } , 
      function(resp){
        console.error( resp )
      }
    );
  }

  return {
    search: search,
    getOne: getOne,
    updateOne: updateOne
  }

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
