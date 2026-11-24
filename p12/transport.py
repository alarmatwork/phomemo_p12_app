"""Connections to a paired P12: Linux RFCOMM socket, or a serial port (Windows COMx,
macOS /dev/cu.*, Linux /dev/rfcommN)."""
from __future__ import annotations

import re
import socket
import time

MAC_RE = re.compile(r"^[0-9A-Fa-f]{2}(:[0-9A-Fa-f]{2}){5}$")


class Connection:
    def __init__(self, target: str, channel: int = 1, timeout: float = 5.0):
        self.target = target
        if MAC_RE.match(target):
            if not hasattr(socket, "AF_BLUETOOTH"):
                raise RuntimeError("RFCOMM sockets need Linux; on Windows/macOS pass the serial port instead")
            s = socket.socket(socket.AF_BLUETOOTH, socket.SOCK_STREAM, socket.BTPROTO_RFCOMM)
            s.settimeout(timeout)
            s.connect((target, channel))
            self._sock, self._ser = s, None
        else:
            import serial  # pyserial
            self._sock, self._ser = None, serial.Serial(target, 115200, timeout=0.2, write_timeout=30)

    def write(self, data: bytes) -> None:
        if self._sock:
            self._sock.sendall(data)
        else:
            self._ser.write(data)
            self._ser.flush()

    def read(self, wait: float = 0.5) -> bytes:
        end, buf = time.time() + wait, bytearray()
        while time.time() < end:
            try:
                if self._sock:
                    self._sock.settimeout(max(0.05, end - time.time()))
                    chunk = self._sock.recv(256)
                else:
                    chunk = self._ser.read(256)
            except (socket.timeout, TimeoutError):
                break
            if chunk:
                buf += chunk
        return bytes(buf)

    def close(self) -> None:
        (self._sock or self._ser).close()

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.close()
