# multimodal-tracker


## Commands run so far (may not be needed when checking the code out)

```
cordova create multimodal-tracker com.luispprieto.multimodaltracker multimodal-tracker
cordova platform add android --save
cordova plugin add cordova-plugin-device --save
cordova plugin add cordova-plugin-device-motion --save
cordova plugin add cordova-plugin-ibeacon --save
cordova plugin add cordova-plugin-file --save
cordova plugin add cordova-plugin-geolocation --save
(... add more commands if other plugins are needed ...)
```

## Setting up

After you clone this repository, if you installed Evothings and Cordova and the Android SDK successfully, it should be enough to run (from inside the project directory):

<!-- cordova prepare android ??-->

```
cordova build android
```
Then, copy the generated .ipk to the phone/tablet (in multimodal-tracker\platforms\android\build\outputs\apk), and install it!

## Using the app

Basically, fire up the app (with bluetooth on) to detect the beacons and accelerometer. Once you click on the record button, the app will periodically write the log from the sensors to a file (normally, stored in /Android/data/com.luispprieto.multimodaltracker/files)

The data itself is "almost-JSON": a succession of JSON arrays of objects, whose structure varies for the accelerometer and beacons samples.

j
