
#include <DHT.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include "string.h"
#include <math.h>
#include <HTTPClient.h>
#include "time.h"
#define WIFI_SSID "noura"
#define WIFI_PASSWORD "password"
#include "ESP32_MailClient.h"
/*
#define emailSenderAccount    "foulenpfe@gmail.com"    
#define emailSenderPassword   "foulenPFE"
#define emailRecipient        "belhadjamor.noura1999@gmail.com"
#define smtpServer            "smtp.gmail.com"
#define smtpServerPort        465
#define emailSubject          "Humidité de sol %"

// The Email Sending data object contains config and data to send
SMTPData smtpData;

// Callback function to get the Email sending status
void sendCallback(SendStatus info);



*/

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

  //Connexion au WIFI
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
/*
// Set the SMTP Server Email host, port, account and password
  smtpData.setLogin(smtpServer, smtpServerPort, emailSenderAccount, emailSenderPassword);

  // Set the sender name and Email
  smtpData.setSender("ESP32", emailSenderAccount);

  // Set Email priority or importance High, Normal, Low or 1 to 5 (1 is highest)
  smtpData.setPriority("High");

  // Set the subject
  smtpData.setSubject(emailSubject);

  // Set the message with HTML format
  smtpData.setMessage("<div style=\"color:#2f4468;\"><h1>Arabic Arduino Lessons!</h1><p>- It's youtube channel by Nader</p></div>", true);
  // Set the email message in text format (raw)
  //smtpData.setMessage("Hello World! - Sent from ESP32 board", false);

  // Add recipients, you can add more than one recipient
  smtpData.addRecipient(emailRecipient);
  //smtpData.addRecipient("YOUR_OTHER_RECIPIENT_EMAIL_ADDRESS@EXAMPLE.com");

  smtpData.setSendCallback(sendCallback);

  //Start sending Email, can be set callback function to track the status
  if (!MailClient.sendMail(smtpData))
    Serial.println("Error sending Email, " + MailClient.smtpErrorReason());

  //Clear all data from Email object to free memory
  smtpData.empty();
*/
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


  //affichage dans le COM :
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


    //Arrosage intelligent ( automatique) 
    if (moisturePercent>300)
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

  // envoyer les données sous form de json 
  doc["temp"]= floor(temperature);
  doc["hum"]= floor(humidity);
  doc["humsol"]= floor(moisturePercent);
  doc["electrovane"]= state;
  doc["manuelle"]= state;

  Serial.println("update data ...");
  POSTData();
 GETData();
  //digitalWrite(electrovane1, HIGH);

//arrosage manuelle :
  if(GETData()== true){
    delay(1000);
    digitalWrite(electrovane1, HIGH);
    state=true;
  }else{
    delay(1000);
    digitalWrite(electrovane1,LOW);
    state=false; 
    }

    
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


bool GETData()
{
      
      if(WiFi.status()== WL_CONNECTED){
      HTTPClient http;
      http.begin(serverName);

      int httpcode=http.GET();
      if (httpcode>0){
        String payload=http.getString();
        Serial.println(httpcode);
        Serial.println(payload);
        return httpcode;

        }else{
         Serial.println("error on http request");

          }
          http.end();
      }
}

// Callback function to get the Email sending status
void sendCallback(SendStatus msg) {
  // Print the current status
  Serial.println(msg.info());

  // Do something when complete
  if (msg.success()) {
    Serial.println("----------------");
  }
}
