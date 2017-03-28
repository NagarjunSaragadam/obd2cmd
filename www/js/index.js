/*
    SimpleSerial index.js
    Created 7 May 2013
    Modified 9 May 2013
    by Tom Igoe
*/

var app = {
    macAddress: "00:00:00:00:00:01",  // get your mac address from bluetoothSerial.list
    chars: "",
	random:0,
	watchvalue:-2,
    trackGpsDelay: 400,
	bluetoothcond:0,
    carWatchDelay: 4000,
    deepMode: false,	
    trackServerDeepDelay: 60000 * 10,
    trackServerDelay: 500,
    connections: {
        engine: false,
        server: false
    },
    watchs: {
        gpsWatchID: false,
        headingWatchID: false,
        carWatchID: false,
        serverWatchID: false
    },
    
    
/*
    Application constructor
 */
    initialize: function() {
        this.bindEvents();				
		      var apiURLarticle = 'http://202.83.27.199/obdapi/api/carread/addobddetails';            
	},
    
    carData: {},

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
        app.display('Configuring.....');
      app.watchs.carWatchID = setInterval(function(){		
            app.Computevalue();
		  if(app.watchvalue==-1)			  		    
			app.startBluetooth();	
		  if(app.watchvalue==0)			  		    
			app.getvinumber();		    			  
		 if(app.watchvalue==1 || app.watchvalue==2 || app.watchvalue==3||app.watchvalue==4)			
            app.getCarRPM();		      
         if(app.watchvalue==5 || app.watchvalue==6 || app.watchvalue==7||app.watchvalue==8)			 
            app.getCarSpeed();	      
         if(app.watchvalue==9 || app.watchvalue==10 || app.watchvalue==11||app.watchvalue==12)			
	        app.getCarEngineLoad(); 	      
         if(app.watchvalue==13 || app.watchvalue==14 || app.watchvalue==15||app.watchvalue==16)			
            app.getCarRadiatorTemp();
        }, app.carWatchDelay);
    },    
    startBluetooth: function(){
        setTimeout(function(){
            bluetoothSerial.isEnabled(function(){                
                app.display("Connecting...Process starting");               
                app.macAddress="00:00:00:00:00:01";
                app.display("Connecting to "+app.macAddress);                
                bluetoothSerial.connect(app.macAddress, function(){                    
                    app.display("Bluetooth Connected to "+app.macAddress);
                    app.state('bluetooth', true);
                    bluetoothSerial.subscribe('\n');   										
                },function(){
                    app.state('bluetooth', false);
                    app.display("Unable to Connect to ODB Device");                 
                    app.startBluetooth();
                });
            },function(){
                app.state('bluetooth', false);
                app.log('Bluetooth Off', true);
            });
       }, 2000);
    },  
    getCarRPM: function(){ 	    
        app.carRequest('01 0C', function(response){
            if(response == false){
                app.connections.engine = false;      
				document.getElementById("rpm").innerHTML="0";
                app.display("Engine is in off state");
            }
            else{
                data = response.substr(12, 5).split(' ');
                app.display(Math.round(((parseInt(data[0], 16)*256) + parseInt(data[1], 16) )/4));                
                if((Math.round(((parseInt(data[0], 16)*256) + parseInt(data[1], 16) )/4)) > 0){
                    app.connections.engine = true;
                    document.getElementById("rpm").innerHTML=(Math.round(((parseInt(data[0], 16)*256) + parseInt(data[1], 16) )/4));
                }else{
                    app.connections.engine = false;                    
					document.getElementById("rpm").innerHTML="0";
                    app.display("Engine is in off state");
                }
            }
        });
    },   
	getvinumber: function(){ 	    
	        app.carRequest('09 02', function(response){
            app.display(response.toString());                        			  
			document.getElementById("vin").innerHTML=(response.toString());
        });	 
    },
    getCarSpeed: function(){ 	    
	        app.carRequest('01 0D', function(response){
            app.display(parseInt(response.substr(12, 2),16));                        
			document.getElementById("speed").innerHTML=(parseInt(response.substr(12, 2),16));
        });	 
    },
    getCarRadiatorTemp: function(){ 	    
            app.carRequest('01 05', function(response){
            app.display(parseInt(response.substr(12, 2),16)-40);   			            
		    document.getElementById("rtemp").innerHTML=(parseInt(response.substr(12, 2),16)-40);  
        });
     },
    getCarEngineLoad: function(){ 		      
            app.carRequest('01 04', function(response){
            app.display((parseInt(response.substr(12, 2),16)*255)/100);            
			document.getElementById("eload").innerHTML=(parseInt(response.substr(12, 2),16));  
        });       
      },	

	
    
    carRequest: function(command, callback){   	    	
        app.sendCommand(command);
        return app.readResponse(callback);  
	
    },
    sendCommand: function(command){
        bluetoothSerial.write(command+'\r');        
    },
    readResponse: function(callback){		
        bluetoothSerial.read(function(response){
            if(response.substr(0, 7) == 'NO DATA') return false;
            return callback(response);
        }); 
    },  

/*
    appends @error to the message div:
*/
    showError: function(error) {
        app.display(error);
    },

/*
    appends @message to the message div:
*/
    display: function(message) {
        var display = document.getElementById("message"), // the message div
            lineBreak = document.createElement("br"),     // a line break
            label = document.createTextNode(message);     // create the label

        display.appendChild(lineBreak);          // add a line break
        display.appendChild(label);              // add the message node
    },
/*
    clears the message div:
*/
    clear: function() {
        var display = document.getElementById("message");
        display.innerHTML = "";
    },
    Computevalue: function() {
		 setTimeout(function(){
		app.watchvalue=app.watchvalue+1;
		if(app.watchvalue==17)
	    {	    		
	    app.watchvalue=1;	    
	    app.display("Reaching Server");
        var apiURLarticle = 'http://202.83.27.199/obdapi/api/carread/addobddetails';            
        var Cardataobj = {};		
		var vehicle_tnumber = document.getElementById('vin').innerHTML;
		var rpm = document.getElementById('rpm').innerHTML;
		var speed = document.getElementById('speed').innerHTML;
		var rtemp = document.getElementById('rtemp').innerHTML;
		var eload = document.getElementById('eload').innerHTML;
        Cardataobj.Vehicle_Tnumber = vehicle_tnumber;
        Cardataobj.Rtemp = rtemp;
        Cardataobj.Speed = speed;
        Cardataobj.Engineload = eload;
		Cardataobj.Rpm = rpm;
		Cardataobj.Requestcount = '00:00:00:00:01';
        $.ajax({
            url: apiURLarticle,
            type: 'POST',
            data: Cardataobj,
            dataType: 'json',
            success: function (data) {
                app.display("Success");                				
            },
            error: function (xhr, status, error) {                
                app.display(xhr+status,+error);                
            }
        });	    			
		}
        }, 2000);
    }
	
};      // end of app

