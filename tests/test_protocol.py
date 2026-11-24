import random

from PIL import Image

from p12 import protocol
from p12.render import compose


def app_pipeline(label: Image.Image) -> Image.Image:
    """The literal steps from the decompiled app: Android postRotate(90) is clockwise,
    then postScale(-1, 1), then P12Printer rotates 180."""
    im = label.rotate(-90, expand=True)              # 90 deg clockwise
    im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    return im.rotate(180, expand=True)


def random_label(w=40):
    random.seed(1)
    im = Image.new("L", (w, 96))
    im.putdata([random.choice((0, 255)) for _ in range(w * 96)])
    return im


def test_transform_matches_app():
    lab = random_label()
    assert list(protocol.label_to_raster(lab).getdata()) == list(app_pipeline(lab).getdata())
    assert protocol.label_to_raster(lab).size == (96, 40)


def test_pack_bits_msb_first():
    im = Image.new("L", (16, 1), 255)
    im.putpixel((0, 0), 0)
    im.putpixel((15, 0), 0)
    assert protocol.pack_bits(im) == bytes([0x80, 0x01])


def test_job_layout():
    lab = Image.new("L", (300, 96), 255)
    job = protocol.build_job(lab, copies=2, density=2)
    assert job[:4] == bytes([0x1F, 0x11, 0x02, 2])
    assert job[4:6] == bytes([0x1B, 0x40])
    header = bytes([0x1D, 0x76, 0x30, 0x00, 12, 0, 300 & 0xFF, 300 >> 8])
    img_len = 8 + 12 * 300
    assert job[6:14] == header
    assert len(job) == 6 + 2 * img_len
    assert job[6 + img_len:6 + img_len + 8] == header


def test_parse_status():
    ev = protocol.parse_status(bytes([0x1A, 0x04, 0xA2, 0x1A, 0x06, 0x88, 0x1A, 0x07, 1, 2, 3, 0x1A, 0x0F, 0x0C]))
    assert ev == [("battery", "medium"), ("paper", False), ("firmware", "1.2.3"), ("print_done", True)]


def test_compose_sizes():
    img = compose("Hello", frame_style="rounded")
    assert img.height == 96 and img.width > 50
    assert compose("x", length_mm=40).width == 320
    q = compose("Wi-Fi", qr="WIFI:S:home;T:WPA;P:secret;;", length_mm=50)
    assert q.width == 400
