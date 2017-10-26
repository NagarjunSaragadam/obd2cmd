
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
		document.getElementById('deviceid').innerHTML=sdsd;
		$("#scan").click(function () {
            app.scan();
                }); 
    },
	
	 scan: function() {
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                if (!result.cancelled) {
					var str = document.getElementById('deviceid').innerHTML;
                    str = str.replace(/[^0-9]+/ig,"");					
					var count=((parseInt(result.text)+parseInt(str))*20)/34;                    
					document.getElementById('Keyresult').innerHTML='File ID:'+result.text+'<br/> Key:'+count;                    
                }
            },
            function (error) {
                alert("Scanning failed: " + error);
            }
       );
    }
	
   



    
	
};     

