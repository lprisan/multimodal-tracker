//Events for the record/stop buttons
$(document).ready(function() {
	//alert("ready!");
	$("#record").hide();
	$("#stop").hide();
    $("#record").click(function(){
        $("#record").hide();
        $("#stop").show();
        startLogging();
    });
    $("#stop").click(function(){
        $("#stop").hide();
        $("#record").show();
        stopLogging();
    });
});

// Temporary array to accumulate data until we write it to file
//Basically, an array of objects which can have properties .timestamp (a milliseconds timestamp of when this was written to the buffer), .beacons (an array of beacons objects with each beacon data) or .acceleration (an object with the acceleration data)
var dataBuffer = [];
// Directory for file logging of data
var dataDir = null;
var logging = false; //To signal whether we are logging the data
var lastWriteToFile = null;
var secondsToLog = 10; //How many seconds to wait until the next writing to file of the data buffer
var currentLogFile = null;
var lastAccSample = null;
var lastGeoSample = null;

function startLogging(){
	logging = true;
	//Create the log file with timestamp as name and empty data
	var filename = "multimodal-tracker-"+Date.now()+".txt"; //TODO: Add also some device ID from the phone/tablet?
	//alert("startLogging");

	dataDir.getFile(filename, {create:true}, function(file) {
	 	console.log("got the file", file);
	 	//alert("got the file "+file);
		//$("#textmsgs").append("got the file "+file.fullPath);
	 	currentLogFile = file;
	 	writeLog("[]");	//write a first, dummy array of empty data
	});
}

function stopLogging(){
	logging = false;
	writeLog(JSON.stringify(dataBuffer)); //Write whatever remaining data there is to the file - if we fail, we lose the data
	dataBuffer = [];
}

function fail(e) {
	console.log("FileSystem Error");
	alert("FileSystem Error");
	console.log(e);
}

function writeLog(str) {
	if(!currentLogFile){
	 console.log("Log file not found!");
	 alert("Current Log file not found!");
	 return false;
	}
	var log = str;
	console.log("going to log "+log);
	//alert("going to log "+log);
	currentLogFile.createWriter(function(fileWriter) {

		fileWriter.seek(fileWriter.length);

		var blob = new Blob([log], {type:'text/plain'});
		fileWriter.write(blob);
		//$("#textmsgs").append("ok, in theory i logged "+Date.now());
		console.log("ok, in theory i worked");
		lastWriteToFile = Date.now();
	}, fail);
	return true;
}





var app = (function()
{
	// Application object.
	var app = {};

	// Specify your beacon 128bit UUIDs here.
	var regions =
	[
		// Estimote Beacon factory UUID.
		{uuid:'B9407F30-F5F8-466E-AFF9-25556B57FE6D'},
		// Sample UUIDs for beacons in our lab.
		{uuid:'F7826DA6-4FA2-4E98-8024-BC5B71E0893E'},
		{uuid:'8DEEFBB9-F738-4297-8040-96668BB44281'},
		{uuid:'A0B13730-3A9A-11E3-AA6E-0800200C9A66'},
		{uuid:'E20A39F4-73F5-4BC4-A12F-17D1AD07A961'},
		{uuid:'A4950001-C5B1-4B44-B512-1370F02D74DE'},
		{uuid:'585CDE93-1B01-42CC-9A13-25009BEDC65E'},	// Dialog Semiconductor.
	];

	// Background detection.
	var notificationID = 0;
	var inBackground = false;
	document.addEventListener('pause', function() { inBackground = true });
	document.addEventListener('resume', function() { inBackground = false });

	// Dictionary of beacons.
	var beacons = {};

	// Timer that displays list of beacons.
	var updateTimer = null;
  var geolocationTimer = null;

	app.initialize = function()
	{
		document.addEventListener(
			'deviceready',
			function() { evothings.scriptsLoaded(onDeviceReady) },
			false);
	};

	function onDeviceReady()
	{
		// Specify a shortcut for the location manager holding the iBeacon functions.
		window.locationManager = cordova.plugins.locationManager;

		// Start tracking beacons!
		startScan();

		// Initialize accelerometer
		initialiseAccelerometer();

		//Initialize the internal file storage for the detailed logs
		initializeFileLogging();

		initializeGeolocation();

		// Display refresh timer, every second
		updateTimer = setInterval(displaySensorList, 1000);
	}

	function initializeGeolocation(){
		console.log(navigator.geolocation); //Alternatively, we could use this other plugin: https://www.npmjs.com/package/cordova-plugin-locationservices
		$("#textmsgs").append("initializing cordova geolocation "+navigator.geolocation);

		function onSuccess(position)
		{
			geolocationHandler(position)
		}

		function onError(error)
		{
			console.log('Geolocation error: ' + error);
		}

		navigator.geolocation.watchPosition(
			onSuccess,
			onError,
			{ timeout: 30000, enableHighAccuracy: true })
	}


	function initializeFileLogging(){
		//$("#textmsgs").append("cordova file "+JSON.stringify(cordova.file));
		//Check that the global file object is available
		//alert("initializing files "+JSON.stringify(cordova.file));
	  console.log(cordova.file);
	    //We get the directory where things will go, see http://www.raymondcamden.com/2014/11/05/Cordova-Example-Writing-to-a-file
		window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function(dir) {
			dataDir = dir; //We store it for later use
			console.log("got main dir",dir);
			//alert("got main dir "+JSON.stringify(dir));
			//$("#textmsgs").append("got main dir "+dir.fullPath);
			$("#record").show(); //We show the record button only if the filesystem is ready
		});

	}


	function initialiseAccelerometer()
		{
			function onSuccess(acceleration)
			{
				accelerometerHandler(acceleration)
			}

			function onError(error)
			{
				console.log('Accelerometer error: ' + error);
			}

			navigator.accelerometer.watchAcceleration(
				onSuccess,
				onError,
				{ frequency: 50 })
		}


		// This gets called every time we sample the accelerometer
		// Basically, add the last sample to the buffer array, to the "lastAccSample" (for later printing) and, if it passed enough time, also invoke the writing to file
		function geolocationHandler(position)
		{

					if(logging){
						//Add timestamp and log registers to the logging variable
						var logEntry = {};
						logEntry.geolocation = position;
						logEntry.timestamp = Date.now();
						dataBuffer.push(logEntry);

						//If enough time has passed, we append the variable to the file
						if(Date.now()>((secondsToLog*1000)+lastWriteToFile)){
							var success = writeLog(JSON.stringify(dataBuffer));
							if(success) dataBuffer = [];
						}
					}

					lastGeoSample = position;


		}

  // This gets called every time we sample the accelerometer
	// Basically, add the last sample to the buffer array, to the "lastAccSample" (for later printing) and, if it passed enough time, also invoke the writing to file
	function accelerometerHandler(acceleration)
	{

				if(logging){
					//Add timestamp and log registers to the logging variable
					var logEntry = {};
					logEntry.acceleration = acceleration;
					logEntry.timestamp = Date.now();
					dataBuffer.push(logEntry);

					//If enough time has passed, we append the variable to the file
					if(Date.now()>((secondsToLog*1000)+lastWriteToFile)){
						var success = writeLog(JSON.stringify(dataBuffer));
						if(success) dataBuffer = [];
					}
				}

				lastAccSample = acceleration;


	}




	function startScan()
	{
		// The delegate object holds the iBeacon callback functions
		// specified below.
		var delegate = new locationManager.Delegate();

		// Called continuously when ranging beacons.
		delegate.didRangeBeaconsInRegion = function(pluginResult)
		{
			//console.log('didRangeBeaconsInRegion: ' + JSON.stringify(pluginResult))
			for (var i in pluginResult.beacons)
			{
				// Insert beacon into table of found beacons.
				var beacon = pluginResult.beacons[i];
				beacon.timeStamp = Date.now();
				var key = beacon.uuid + ':' + beacon.major + ':' + beacon.minor;
				beacons[key] = beacon;
			}
		};

		// Called when starting to monitor a region.
		// (Not used in this example, included as a reference.)
		delegate.didStartMonitoringForRegion = function(pluginResult)
		{
			//console.log('didStartMonitoringForRegion:' + JSON.stringify(pluginResult))
		};

		// Called when monitoring and the state of a region changes.
		// If we are in the background, a notification is shown.
		delegate.didDetermineStateForRegion = function(pluginResult)
		{
			if (inBackground)
			{
				// Show notification if a beacon is inside the region.
				// TODO: Add check for specific beacon(s) in your app.
				if (pluginResult.region.typeName == 'BeaconRegion' &&
					pluginResult.state == 'CLRegionStateInside')
				{
					cordova.plugins.notification.local.schedule(
						{
							id: ++notificationID,
							title: 'Beacon in range',
							text: 'iBeacon Scan detected a beacon, tap here to open app.'
						});
				}
			}
		};

		// Set the delegate object to use.
		locationManager.setDelegate(delegate);

		// Request permission from user to access location info.
		// This is needed on iOS 8.
		locationManager.requestAlwaysAuthorization();

		// Start monitoring and ranging beacons.
		for (var i in regions)
		{
			var beaconRegion = new locationManager.BeaconRegion(
				i + 1,
				regions[i].uuid);

			// Start ranging.
			locationManager.startRangingBeaconsInRegion(beaconRegion)
				.fail(console.error)
				.done();

			// Start monitoring.
			// (Not used in this example, included as a reference.)
			locationManager.startMonitoringForRegion(beaconRegion)
				.fail(console.error)
				.done();
		}
	}

	function displaySensorList()
	{

		// Add beacon data to the buffer data
		var timeNow = Date.now();
		if(logging){
			//Add timestamp and log registers to the logging variable
			var logEntry = {};
			logEntry.beacons = beacons;
			logEntry.timestamp = timeNow;
			dataBuffer.push(logEntry);

			//If enough time has passed, we append the variable to the file
			if(timeNow>((secondsToLog*1000)+lastWriteToFile)){
				var success = writeLog(JSON.stringify(dataBuffer));
				if(success) dataBuffer = [];
			}
		}

		// Clear seonsor display list.
		$('#found-beacons').empty();
		$('#found-accelerometer').empty();
		$('#found-geolocation').empty();

		// Update the accelerometer data
		if(lastAccSample){
			var element = $(
				'<li>'
				+	'X: ' + lastAccSample.x + '<br />'
				+	'Y: ' + lastAccSample.y + '<br />'
				+	'Z: ' + lastAccSample.z + '<br />'
				+ '</li>'
			);
			$('#found-accelerometer').append(element);
		}

		// Update the geolocation data
		if(lastGeoSample){
			var element = $(
				'<li>'
				+	'Lat: ' + lastGeoSample.coords.latitude + '<br />'
				+	'Long: ' + lastGeoSample.coords.longitude + '<br />'
				+ '</li>'
			);
			$('#found-geolocation').append(element);
		}

		// Update beacon list.
		$.each(beacons, function(key, beacon)
		{
			// Only show beacons that are updated during the last 60 seconds.
			if (beacon.timeStamp + 60000 > timeNow)
			{
				// Map the RSSI value to a width in percent for the indicator.
				var rssiWidth = 1; // Used when RSSI is zero or greater.
				if (beacon.rssi < -100) { rssiWidth = 100; }
				else if (beacon.rssi < 0) { rssiWidth = 100 + beacon.rssi; }

				// Create tag to display beacon data.
				var element = $(
					'<li>'
					+	'<strong>UUID: ' + beacon.uuid + '</strong><br />'
					+	'Major: ' + beacon.major + '<br />'
					+	'Minor: ' + beacon.minor + '<br />'
					+	'Proximity: ' + beacon.proximity + '<br />'
					+	'RSSI: ' + beacon.rssi + '<br />'
					+ 	'<div style="background:rgb(255,128,64);height:20px;width:'
					+ 		rssiWidth + '%;"></div>'
					+ '</li>'
				);

				$('#warning').remove();
				$('#found-beacons').append(element);
			}
		});
	}



	return app;
})();

app.initialize();
