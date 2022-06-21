#include <DHT.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include "string.h"
#include <math.h>
#include <HTTPClient.h>
#include "time.h"
#define WIFI_SSID "noura"
#define WIFI_PASSWORD "password"


#define dhtpin 2
#define soilpin 32
boolean state = false;
const int electrovane1 = 4;

   
DHT dht(dhtpin,DHT11);

unsigned long epochTime;
unsigned long dataMillis=0;

String serverName = "https://smartwaterring.herokuapp.com/api/sensors";

StaticJsonDocument<500> doc;


void setup()
{
  Serial.begin(115200);
  //begin dht11 
  dht.begin();

  //electrovane 
  pinMode(electrovane1, OUTPUT);
  digitalWrite(electrovane1, HIGH);

  
  Serial.print("Connecting to ");
  Serial.print(WIFI_SSID);
  Serial.print(" with password ");
  Serial.println(WIFI_PASSWORD);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while(WiFi.status() != WL_CONNECTED) {
  delay(500);
  Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to WiFi network with IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.println("");

}
void loop()
{
 if(millis()- dataMillis > 15000 || dataMillis == 0){

  dataMillis =millis();
  epochTime-getTime();

  Serial.println(epochTime);
  float temperature=dht.readTemperature();
  float humidity = dht.readHumidity();

  float moisture=analogRead(soilpin);
  float moisturePercent=100.00-((moisture/4095.00)*100);
  
  //humidity air 
  Serial.print("Temperature : ");
  Serial.print(String(temperature));
  Serial.print(" C°");

  Serial.print("\nHumidity : ");
  Serial.print(String(humidity));
  Serial.print(" %");
 

  //humidity sol
  Serial.print("\nMoisture : ");
  Serial.print(String(moisturePercent));
  Serial.print(" %");
  Serial.print("\n ");

    if (moisturePercent>30)
  {
    delay(1000);
    digitalWrite(electrovane1, HIGH);
    state=true;
  }

  else
  {
    delay(1000);
    digitalWrite (electrovane1,LOW);
    state=false;
  
  }

  delay (1000);


  doc["temp"]= floor(temperature);
  doc["hum"]= floor(humidity);
  doc["humsol"]= floor(moisturePercent);
  doc["electrovane"]= state;

  Serial.println("update data ...");
  POSTData();
  GETData();
  }
}



unsigned long getTime(){
    time_t now;

    struct tm timeinfo;
    if(!getLocalTime(&timeinfo)){
      return (0);
      }
      time(&now);
      return now;
 
  }





void POSTData()
{
      
      if(WiFi.status()== WL_CONNECTED){
      HTTPClient http;
      http.begin(serverName);
      http.addHeader("Content-Type", "application/json");

      String json;
      serializeJson(doc, json);

      Serial.println(json);
      int httpResponseCode = http.POST(json);
      Serial.println(httpResponseCode);
      }
}


void GETData()
{
      
      if(WiFi.status()== WL_CONNECTED){
      HTTPClient http;
      http.begin(serverName);

      int httpcode=http.GET();
      if (httpcode>0){
        String payload=http.getString();
        Serial.println(httpcode);
        Serial.println(payload);

        }else{
         Serial.println("error on http request");

          }
          http.end();
      }
}
