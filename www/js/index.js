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
    trackGpsDelay: 400,
    carWatchDelay: 10000,
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
        alert("Starting OBD APP");							
    },
    
    carData: {},
/*
    bind any events that are required on startup to listeners:
*/
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);        
	    DataButton.addEventListener('touchend', this.startTrackCar, false);     	   
		DataButtonRPM.addEventListener('touchend', this.getCarRPM, false);     	   
		DataButtonCS.addEventListener('touchend', this.getCarSpeed, false);     	   
		DataButtonRT.addEventListener('touchend', this.getCarRadiatorTemp, false);     	   
		DataButtonEL.addEventListener('touchend', this.getCarEngineLoad, false);     	   
		Testing.addEventListener('touchend', this.TestTrackCar, false);     	   
    },

/*
    this runs when the device is ready for user interaction:
*/
    onDeviceReady: function() {  	    
       app.CreateConnection();    
      
    },
/*
    Connects if not connected, and disconnects if connected:
*/
    manageConnection: function() {        
         setInterval(function() {
            app.clear();
            app.display("Attempting to connect. " +
                "Make sure the serial port is open on the target device. ");            
                app.startBluetooth();                     
              }, 10000);
        },      
    
    CreateConnection:function(){
		app.clear();
        app.display("Attempting to connect. " +
                "Make sure the serial port is open on the target device. ");   
         app.startBluetooth();		 
    },
	
    startTrackCar: function(){
        app.display('Tracking Car Data...');
      app.watchs.carWatchID = setInterval(function(){		
		  if(Math.floor((Math.random() * 100) + 1)%2==0)
            app.getCarRPM();		      
		  else
            app.getCarSpeed();	      
	      //app.getCarEngineLoad(); 	      
            //app.getCarRadiatorTemp();
        }, app.carWatchDelay);
    },
	
	
	 TestTrackCar: function(){
        app.display('Tracking Car Data...'); 	
      app.watchs.carWatchID = setInterval(function(){	
		  app.getCarSpeed();
            app.getCarRPM();
            app.getCarRadiatorTemp();		 
            app.getCarEngineLoad();            
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
                app.display("Engine is in off state");
            }
            else{
                data = response.substr(12, 5).split(' ');
                app.display(Math.round(((parseInt(data[0], 16)*256) + parseInt(data[1], 16) )/4));                
                if((Math.round(((parseInt(data[0], 16)*256) + parseInt(data[1], 16) )/4)) > 0){
                    app.connections.engine = true;
                    app.display("Engine is in on");
                }else{
                    app.connections.engine = false;                    
                    app.display("Engine is in off state");
                }
            }
        });
    },   
	
    getCarSpeed: function(){ 	    
	        app.carRequest('01 0D', function(response){
            app.display(parseInt(response.substr(12, 2),16));                        
			app.display("Done CS");  
        });	 
    },
    getCarRadiatorTemp: function(){ 	    
            app.carRequest('01 05', function(response){
            app.display(parseInt(response.substr(12, 2),16)-40);   			            
		    app.display("Done RT");  
        });
     },
    getCarEngineLoad: function(){ 		      
            app.carRequest('01 04', function(response){
            app.display((parseInt(response.substr(12, 2),16)*255)/100);            
			app.display("Done EL");  
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
    subscribes to a Bluetooth serial listener for newline
    and changes the button:
*/
    openPort: function() {
        // if you get a good Bluetooth serial connection:
        app.display("Connected to: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Disconnect";
        // set up a listener to listen for newlines
        // and display any new data that's come in since
        // the last newline:
        bluetoothSerial.subscribe('\n', function (data) {
            app.clear();
            app.display(data);
        });
    },

/*
    unsubscribes from any Bluetooth serial listener and changes the button:
*/
    closePort: function() {
        // if you get a good Bluetooth serial connection:
        app.display("Disconnected from: " + app.macAddress);
        // change the button's name:
        connectButton.innerHTML = "Connect";
        // unsubscribe from listening:
        bluetoothSerial.unsubscribe(
                function (data) {
                    app.display(data);
                },
                app.showError
        );
    },
	
	  disconnectServer: function(){
        if(app.socket) {
            app.socket.disconnect();
            app.socket = false;
        }
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
    }
};      // end of app

