FROM python:3.12-slim

RUN pip install --no-cache-dir pillow==11.0.0 pyserial==3.5 qrcode==8.0

WORKDIR /app
COPY p12 ./p12
COPY web ./web

# PRINTER: tcp://bridge-ip:9100 (ESP32 / Raspberry Pi bridge), a Bluetooth MAC
# (needs host networking + a Bluetooth stack on the NAS), or a serial device like /dev/rfcomm0.
ENV PRINTER="" PYTHONUNBUFFERED=1
EXPOSE 8080

HEALTHCHECK --interval=60s --timeout=5s \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/api/info', timeout=4)"

CMD ["python", "-m", "p12", "serve", "--port", "8080"]
