var myApp = angular.module('TodoAPP', ['ui.bootstrap', "ngRoute"]);

var mockTareas = [
	{
	    id: 1,
	    name: 'La tarea de Pepito',
	    image: './imagenes/tarea3.png',
	    date: '2017-03-07T03:00:00.000Z',
	    priorityNumber: 1,
	    priority: 'High',
	    desc: 'Pepito debe encotrar a su mama',
	    status: 'Doing' 
	}, 
	{
		id: 2,
	    name: 'La tarea de Juan',
	    image: './imagenes/tarea3.png',
	    date: '2017-02-01T03:00:00.000Z',
	    priorityNumber: 2,
	    priority: 'Medium',
	    desc: 'Ir a tomar mates al rio ',
	    status:'Done'
	},
	{
		id: 3,
	    name: 'La tarea de Jorge',
	    image: './imagenes/tarea3.png',
	    date: '2017-02-09T03:00:00.000Z',
	    priorityNumber: 3,
	    priority: 'Low',
	    desc: 'Preparar el cumpleaños feliz ',
	    status: 'To do'
	},
	{
	    id: 4,
	    name: 'Pudrete Flanders',
	    image: './imagenes/tarea3.png',
	    date: '2017-02-07T03:00:00.000Z',
	    priorityNumber: 1,
	    priority: 'High',
	    desc: 'Pudrete Flanders',
	    status: 'Doing'
	}
];

// Directiva para las tareas
myApp.directive('tareaDirective', function() {
	return {
		restrict: 'E',
		templateUrl:'./js/tarea.html',
		controller:'tareaDirectiveController'
	};
});

//Directiva para el filtro y search
myApp.directive('filtroDirective', function() {
	return {
		restrict: 'E',
		templateUrl:'./js/filtro.html'
	};
});

//Directiva de edicion
myApp.directive('editarDirective', function() {
	return {
		restrict: 'E',
		scope: {
        tarea: '=',
        guardar: '&',
        titulo: '@'
      	},
		templateUrl:'./js/editar.html'
	};
});


// MenuController
function agregarController ($scope, Storage, $location) {
	    	
	$scope.nuevaTarea={};
	
	$scope.guardar = function(){
		
		$scope.nuevaTarea.image='./imagenes/tarea3.png';
		$scope.nuevaTarea.status='To do';
 		Storage.save($scope.nuevaTarea);
 		$scope.nuevaTarea={};
 		$location.path('/')
	}

}

// MoviesController
myApp.controller('TodoAPPController', ["$scope",'Storage',
	function($scope,Storage) {
	 	$scope.tarealist = Storage.list();
  		$scope.reverse = true;

		$scope.delete = function(id) {
	    	Storage.remove(id);
	    	$scope.tarealist = Storage.list();
	    }
	    $scope.sortBy = function(propertyName) {
	    	$scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
	    	$scope.propertyName = propertyName;
  		}

  		$scope.customSort = function (tarea) {
  			switch($scope.propertyName) {
  				case 'date':
  					return new Date(tarea.date).getTime();
  				case 'name':
  					return tarea.name;
  				case 'priorityNumber':
  					return tarea.priorityNumber;
  			}

  		}
	}
]);

// Service for local storage
myApp.service('Storage', ['$window',
    function($window) {
        var Tareas = [];
        function setPriorityName(tarea){

        	switch (tarea.priorityNumber) {
        		case 1:
	        		tarea.priority=	'High';
	        		break;
        		case 2:
	        		tarea.priority=	'Medium';
	        		break;
        		case 3:
        			tarea.priority=	'Low';
        			break;
        	}
        }

        this.save = function(Tarea) {
        	var lastId = Tareas[Tareas.length-1].id;
        	Tarea.id=++lastId;
        	setPriorityName(Tarea);
            Tareas.push(Tarea);
            TareasString = JSON.stringify(Tareas);
            $window.localStorage.setItem('tarealist', TareasString);

        }

        this.get = function(key) {
        	return Tareas.find(function(tarea, index, arrayTareas){
        		return tarea.id.toString() === key;
        	});
        }

        this.remove = function(key) {
        	var  index = Tareas.findIndex(function(tarea,index,arrayTareas){
        		return tarea.id.toString()===key.toString();
        	});
        	if (index != -1){
        		Tareas.splice(index,1);
        		$window.localStorage.setItem('tarealist',JSON.stringify(Tareas));
        	}
        	
  		}

        this.list = function() {
        	if (!$window.localStorage) {
            	alert('No tienes localStorage activado');
	        } else {
	        	var ls = angular.fromJson($window.localStorage.getItem('tarealist'));

	        	if (!ls) {
	        		$window.localStorage.setItem('tarealist', JSON.stringify(mockTareas));
	        		Tareas = mockTareas;
	        	} else {
	        		Tareas = ls;
	        	}
	        }

	        return Tareas;
        }

        this.edit = function(key, Tarea){
        	setPriorityName(Tarea);
        	Tareas.forEach(function(tarea,index,arrayTareas){
        		if(tarea.id.toString()===key){
        			Object.assign(tarea, Tarea);
        		}
        	});

        	$window.localStorage.setItem('tarealist',JSON.stringify(Tareas) );
        }
    }


]);

myApp.controller("tareaDirectiveController",['Storage',"$scope",function(Storage,$scope){
	$scope.eliminar= function(id) {

		if (confirm('¿Estas seguro?')) {
			Storage.remove(id);
		}
		

	}
}])

myApp.controller("editarRouteController",['Storage',"$scope","$routeParams","$location", function (Storage,$scope,$routeParams,$location){
	$scope.tareaAEditar = Object.assign({}, Storage.get($routeParams.tareaId));
		$scope.guardar=function(){
		Storage.edit($routeParams.tareaId,$scope.tareaAEditar);
		$location.path('/')
		};
}])

myApp.config(function($routeProvider){
    $routeProvider
        .when("/", {
            templateUrl: "./vistas/tarea.html",
            controller: "TodoAPPController"
        })
        .when("/editar/:tareaId", {  
            templateUrl: "./vistas/editar.html",
            controller: "editarRouteController"
        })
        .when("/agregar", {              
            templateUrl: "./vistas/agregar.html",
            controller: ['$scope', 'Storage','$location', agregarController]
        });
    })

