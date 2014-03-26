int x = 0;

void setup(){
  Serial.begin(9600);
}

void loop(){
  if(x == 0){  
    Serial.println("E5F9D2B\r\n");
  }
  x++;
}
