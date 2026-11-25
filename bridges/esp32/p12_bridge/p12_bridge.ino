// P12 / P12 Pro Wi-Fi bridge for an ORIGINAL ESP32 (WROOM/WROVER/PICO, e.g. M5Stack ATOM Lite).
// ESP32-S2/S3/C3/C6 and ESP8266 have no Bluetooth Classic and cannot talk to the printer.
//
// Holds ONE Bluetooth SPP connection to the printer open and exposes it as a raw TCP socket on
// port 9100. Point the Docker container at it with PRINTER=tcp://<bridge-ip>:9100
//
// First start: no Wi-Fi saved, so it opens the access point "P12-bridge-setup". Join it with a
// phone, pick your Wi-Fi, enter the password and (optionally) the printer's Bluetooth address.
// Hold the button while powering on to forget Wi-Fi and open the setup page again.
//
// LED (ATOM Lite, G27): blue = Wi-Fi, white = setup page, yellow = connecting to printer,
// green = ready, purple = data flowing, red = printer not reachable (retries every 10 s).
// Short button press (G39): drop and reconnect the printer.
//
// Build: PlatformIO (platformio.ini next to this folder), or Arduino IDE with board
// "M5Stack-ATOM" / "ESP32 Dev Module", partition "Huge APP (3MB No OTA)", library "WiFiManager".

#include <WiFi.h>
#include <WiFiManager.h>
#include <ESPmDNS.h>
#include <Preferences.h>
#include "BluetoothSerial.h"

#if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED) || !defined(CONFIG_BT_SPP_ENABLED)
#error "No Bluetooth Classic SPP on this chip: use an original ESP32 (not S2/S3/C3/C6)."
#endif

static const char* DEFAULT_PRINTER = "20:4F:9F:39:BD:04";
static const char* HOSTNAME = "p12-bridge";
static const uint16_t TCP_PORT = 9100;
static const int LED_PIN = 27;  // SK6812 on ATOM Lite
static const int BTN_PIN = 39;  // active low
static const uint32_t RETRY_MS = 10000, CLIENT_IDLE_MS = 30000;

BluetoothSerial bt;
WiFiServer server(TCP_PORT);
Preferences prefs;
uint8_t printerMac[6];
String printerStr;
uint8_t buf[2048];
uint32_t lastTry = 0;

void led(uint8_t r, uint8_t g, uint8_t b) { neopixelWrite(LED_PIN, r, g, b); }
void ledReady() { if (bt.connected()) led(0, 25, 0); else led(30, 0, 0); }

bool parseMac(const String& s, uint8_t out[6]) {
  unsigned v[6];
  if (sscanf(s.c_str(), "%x:%x:%x:%x:%x:%x", &v[0], &v[1], &v[2], &v[3], &v[4], &v[5]) != 6) return false;
  for (int i = 0; i < 6; i++) { if (v[i] > 255) return false; out[i] = v[i]; }
  return true;
}

bool ensurePrinter() {
  if (bt.connected()) return true;
  lastTry = millis();
  led(30, 20, 0);
  Serial.printf("connecting to printer %s ...\n", printerStr.c_str());
  bool ok = bt.connect(printerMac);
  Serial.println(ok ? "printer connected (kept open)" : "printer not reachable (off, asleep or connected elsewhere?)");
  ledReady();
  return ok;
}

void setup() {
  Serial.begin(115200);
  pinMode(BTN_PIN, INPUT);
  led(0, 0, 30);

  prefs.begin("p12", false);
  printerStr = prefs.getString("mac", DEFAULT_PRINTER);

  WiFiManager wm;
  WiFiManagerParameter macParam("mac", "Printer Bluetooth address", printerStr.c_str(), 17);
  wm.addParameter(&macParam);
  wm.setHostname(HOSTNAME);
  wm.setConfigPortalTimeout(300);
  wm.setAPCallback([](WiFiManager*) { led(20, 20, 20); Serial.println("setup page: join Wi-Fi 'P12-bridge-setup'"); });
  if (digitalRead(BTN_PIN) == LOW) {
    Serial.println("button held: forgetting Wi-Fi");
    wm.resetSettings();
  }
  if (!wm.autoConnect("P12-bridge-setup")) ESP.restart();

  String entered = String(macParam.getValue());
  entered.trim();
  entered.toUpperCase();
  uint8_t tmp[6];
  if (entered != printerStr && parseMac(entered, tmp)) {
    printerStr = entered;
    prefs.putString("mac", printerStr);
  }
  if (!parseMac(printerStr, printerMac)) parseMac(DEFAULT_PRINTER, printerMac);

  WiFi.setSleep(false);
  MDNS.begin(HOSTNAME);
  MDNS.addService("p12", "tcp", TCP_PORT);
  Serial.printf("Wi-Fi ok: bridge at tcp://%s:%u (%s.local)\n", WiFi.localIP().toString().c_str(), TCP_PORT, HOSTNAME);

  bt.begin(HOSTNAME, true);  // master mode
  bt.setPin("0000");         // used only if the printer asks for a PIN
  server.begin();
  server.setNoDelay(true);
  ensurePrinter();
}

void relay(WiFiClient& client) {
  Serial.println("client connected");
  uint32_t idle = millis();
  while (client.connected() && bt.connected()) {
    bool active = false;
    int n = client.available();
    if (n > 0) {
      n = client.read(buf, min(n, (int)sizeof(buf)));
      if (n > 0) { bt.write(buf, n); active = true; }
    }
    n = bt.available();
    if (n > 0) {
      n = bt.readBytes(buf, min(n, (int)sizeof(buf)));
      if (n > 0) { client.write(buf, n); active = true; }
    }
    if (active) { idle = millis(); led(25, 0, 25); }
    else if (millis() - idle > 150) ledReady();
    if (millis() - idle > CLIENT_IDLE_MS) break;  // drop stale clients
    delay(1);
  }
  bt.flush();
  client.stop();
  ledReady();
  Serial.println("client done");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) { led(0, 0, 30); WiFi.reconnect(); delay(1000); return; }

  if (digitalRead(BTN_PIN) == LOW) {  // manual reconnect
    Serial.println("button: reconnecting printer");
    bt.disconnect();
    while (digitalRead(BTN_PIN) == LOW) delay(10);
    ensurePrinter();
  }
  if (!bt.connected() && millis() - lastTry > RETRY_MS) ensurePrinter();

  while (bt.available()) bt.read();  // discard unsolicited replies between clients

  WiFiClient client = server.available();
  if (!client) { delay(10); return; }
  if (!ensurePrinter()) { client.stop(); return; }
  relay(client);
}
