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
.factory('Store', function(){

  //
  console.log( 'mwnoteoa.services.Store service is initializing...' );


  var _stores = [
    { id:'44030001', name:'阿里之门', tel:'18665819711', address:'深圳市南山区里山路3栋401' },
    { id:'44030002', name:'驿站', tel:'18665819712', address:'深圳市南山区里山路3栋401' },
    { id:'44030003', name:'天福', tel:'18665819713' , address:'深圳市南山区里山路3栋401' }
  ]


  function search(){
    return _stores;
  }

  return {
    search: search
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
