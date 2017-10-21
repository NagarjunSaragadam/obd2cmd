
var app = {
   
    Application constructor
 */
    initialize: function() {
        this.bindEvents();		
	},

/*
    bind any events that are required on startup to listeners:
*/
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);  		
    },

/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {  	    
       app.startTrackCar();
    },
	
    startTrackCar: function(){
     window.plugins.imei.get(
  function(imei) {
    alert("got imei: " + imei);
  },
  function() {
    alert("error loading imei");
  }
);
    }
	
};      // end of app

