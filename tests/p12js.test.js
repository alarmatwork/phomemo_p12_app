// Cross-check the JS encoder against the Python one: node tests/p12js.test.js
const assert = require("assert");
const { execFileSync } = require("child_process");
const path = require("path");
const P12 = require("../web/p12.js");

const W = 37;
let seed = 7;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) % 2 ? 0 : 255);
const px = Array.from({ length: W * 96 }, rnd);
const gray = (x, y) => px[y * W + x];

for (const mirror of [false, true]) {
  const js = Buffer.from(P12.buildJob(gray, W, { copies: 2, density: 2, mirror }));
  const py = execFileSync(path.join(__dirname, "..", ".venv", "bin", "python"), ["-I", "-c", `
import sys, json
sys.path.insert(0, ${JSON.stringify(path.join(__dirname, ".."))})
from PIL import Image
from p12 import protocol
px = json.loads(sys.stdin.read())
im = Image.new("L", (${W}, 96)); im.putdata(px)
sys.stdout.buffer.write(protocol.build_job(im, copies=2, density=2, mirror=${mirror ? "True" : "False"}))
`], { input: JSON.stringify(px) });
  assert.deepStrictEqual(js, py, `JS and Python jobs differ (mirror=${mirror})`);
}

assert.deepStrictEqual(P12.parseStatus([0x1a, 0x04, 0xa1, 0x1a, 0x05, 0x99]), [["battery", "full"], ["cover_open", true]]);
console.log("ok: JS encoder matches Python encoder byte-for-byte");
