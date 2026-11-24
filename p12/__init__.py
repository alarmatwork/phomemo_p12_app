"""Driver for the P12 12 mm Bluetooth label printer (PrintMaster protocol)."""
from .protocol import HEAD_DOTS, DOTS_PER_MM, build_job, label_to_raster, parse_status  # noqa: F401
