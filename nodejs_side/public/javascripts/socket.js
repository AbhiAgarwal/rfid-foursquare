//This is basically setting up our top level app.
var todoApp = angular.module('todoApp', []);

todoApp.factory('Data', function() {
    return {
        fetch_incomplete: function() {
            //query.equalTo("completed", false);
            return ['Welcome to Foursquare Checkin'];
        },
        save: function(todo_raw) {
            return todo_raw;
        }
    }
});

var socket = io.connect('http://lvh.me:3000');
todoApp.controller('TodoCtrl', function($scope, Data) {
    $scope.todos = {
        new_todo: {
            title: '',
            save: function() {
                Data.save({title: $scope.todos.new_todo.title});
                $scope.todos.list.push($scope.todos.new_todo.title);
                $scope.todos.new_todo.title = '';
            }
        },
        list: [],
    };

    $scope.init = function() {
        $scope.todos.list = Data.fetch_incomplete();
    }

    socket.on('checkinsuccessful', function(data){
        if(data.num == 1){
            $scope.todos.new_todo.title = 'Successful';
            $('#buttonclickthis').click();
            $scope.$apply();
        } else if(data.num == 2){
            $scope.todos.new_todo.title = 'Reading RFID/NFC Card';
            $('#buttonclickthis').click();
            $scope.$apply();
        } else if(data.num == 3){
            $scope.todos.new_todo.title = "You've to register sorry - go to http://lvh:3000/login";
            $('#buttonclickthis').click();
            $scope.$apply();
        } else if(data.num == 4){
            $scope.todos.new_todo.title = "User Registered! Congrats :)";
            $('#buttonclickthis').click();
            $scope.$apply();
        } else if(data.num == 5){
            $scope.todos.new_todo.title = "Re-tap card it's wrong!";
            $('#buttonclickthis').click();
            $scope.$apply();
        } else if(data.num == 6){
            $scope.todos.new_todo.title = "Tap again please!";
            $('#buttonclickthis').click();
            $scope.$apply();
        }

    });
});

var refrFun = function(){
    location.reload();
}
