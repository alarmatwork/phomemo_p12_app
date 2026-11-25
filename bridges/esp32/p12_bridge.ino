// P12 Wi-Fi bridge for an ORIGINAL ESP32 (WROOM/WROVER). ESP32-S2/S3/C3/C6 have no
// Bluetooth Classic and cannot talk to the P12.
//
// It connects to the printer over Bluetooth SPP and exposes it as a raw TCP socket on
// port 9100. Point the Docker container at it with PRINTER=tcp://<esp32-ip>:9100
//
// Arduino IDE: board "ESP32 Dev Module", Partition scheme "Huge APP (3MB No OTA)"
// (Bluetooth Classic + Wi-Fi does not fit the default partition).

#include <WiFi.h>
#include "BluetoothSerial.h"

const char* WIFI_SSID = "your-wifi";
const char* WIFI_PASS = "your-password";
// Printer MAC: printed on the label under the printer, or shown by your phone's Bluetooth settings.
uint8_t PRINTER_MAC[6] = {0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF};
const uint16_t TCP_PORT = 9100;

BluetoothSerial bt;
WiFiServer server(TCP_PORT);
uint8_t buf[1024];

bool ensurePrinter() {
  if (bt.connected()) return true;
  Serial.println("connecting to printer...");
  bool ok = bt.connect(PRINTER_MAC);
  Serial.println(ok ? "printer connected" : "printer not reachable (off or asleep?)");
  return ok;
}

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(300); Serial.print("."); }
  Serial.printf("\nWi-Fi ok, bridge at tcp://%s:%u\n", WiFi.localIP().toString().c_str(), TCP_PORT);

  bt.begin("P12-bridge", true);   // master mode
  bt.setPin("0000");              // used only if the printer asks for a PIN
  server.begin();
  server.setNoDelay(true);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) { WiFi.reconnect(); delay(1000); return; }
  WiFiClient client = server.available();
  if (!client) { delay(10); return; }

  Serial.println("client connected");
  if (!ensurePrinter()) { client.stop(); return; }

  unsigned long idle = millis();
  while (client.connected() && bt.connected()) {
    int n = client.available();
    if (n > 0) {
      n = client.read(buf, min(n, (int)sizeof(buf)));
      bt.write(buf, n);
      idle = millis();
    }
    n = bt.available();
    if (n > 0) {
      n = bt.readBytes(buf, min(n, (int)sizeof(buf)));
      client.write(buf, n);
      idle = millis();
    }
    if (millis() - idle > 30000) break;  // drop stale clients
    delay(1);
  }
  client.stop();
  Serial.println("client done");
}
