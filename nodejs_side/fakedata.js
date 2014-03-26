var serialPort = require("serialport");

var sp = new serialPort.SerialPort("/dev/cu.usbmodem1421", {
    baudrate: 9600,
});

sp.on("open", function (data) {
  sp.write('E5F9D2B\r\n');
});
