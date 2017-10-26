
var app = {
   
    
 
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
		var sdsd=device.uuid;
        alert(device.uuid);	 
		document.getElementById('deviceid').innerHTML=sdsd;
    }
	
   



    
	
};     

