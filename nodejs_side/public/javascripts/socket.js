var socket = io.connect('http://lvh.me:3000');

socket.on('checkinsuccessful', function(data){
    if(data.num == 1){
        $('#current').hide();
        $('#current').html("Successful!");
        $('#current').show();
    } else {
        $('#current').hide();
        $('#current').html("Reading RFID/NFC Card!");
        $('#current').show();
    }
});
