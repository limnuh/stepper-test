## Intallation

Required: https://github.com/sarfata/pi-blaster

```
npm install
```

## Pinout:

<img src="https://raw.githubusercontent.com/limnuh/stepper-test/master/src/public/pinout.png">

## Usage

#### Run:
```
start pi-blaster: sudo ./pi-blaster
```
```
config: sudo pi-blaster --gpio 10
```
```
node server.js
```

Then, you can open the `http:///localhost:3000`


#### Test runs:
```
LED=true node server
```
```
STEPPER=true node server
```
```
CNC=true node server
```
```
SERVO=true node server
```



