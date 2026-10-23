"""
（路燈圖層 2026-10-23 依使用者決定移除，本檔不再輸出路燈。）

把臺北市開放資料轉成網站用的精簡 JSON（放在 public/data/city/）。網站本身不跑這支，
資料更新時在本機重跑一次即可。

需要的套件：pyshp、pyproj、shapely（pip install pyshp pyproj shapely）

用法：
  python3 src/scripts/process_city_layers.py <原始資料資料夾>

原始資料資料夾裡要有（檔名照下面）：
  arcade/Finishgfl97.shp（+.dbf .shx）  臺北市騎樓整平工程完成路段表（data.taipei，都發局建管處）
  wl_788.kml、wl_100.kml、wl_130.kml      臺北市降雨積水模擬圖 112 年更新版（data.taipei，工務局水利處）

輸出：
  public/data/city/arcades.json          騎樓整平路段（GeoJSON 面）
  public/data/city/waterlog_<情境>.json   積水模擬（GeoJSON 面，依深度分級）
"""
import csv
import json
import math
import os
import re
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict

import shapefile
from pyproj import Transformer
from shapely.geometry import Polygon, MultiPolygon, mapping
from shapely.validation import make_valid

SRC = sys.argv[1] if len(sys.argv) > 1 else '.'
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'data', 'city')
os.makedirs(OUT, exist_ok=True)

# TWD97 二度分帶（EPSG:3826）→ WGS84
to_wgs = Transformer.from_crs('EPSG:3826', 'EPSG:4326', always_xy=True)


def r6(v):
    # 小數 5 位約 1 公尺，對這幾層的顯示已經足夠
    return round(v, 5)


def write(name, obj):
    path = os.path.join(OUT, name)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))
    print(f'{name}: {os.path.getsize(path) / 1024:.0f} KB')


# ── 騎樓整平路段 ────────────────────────────────────────────
def roc_date(s):
    """民國年月日（例：911024）→ 西元 2002-10-24；格式不對就原樣回傳。"""
    s = (s or '').strip()
    m = re.fullmatch(r'(\d{2,3})(\d{2})(\d{2})', s)
    if not m:
        return s
    return f'{int(m.group(1)) + 1911}-{m.group(2)}-{m.group(3)}'


def arcades():
    r = shapefile.Reader(os.path.join(SRC, 'arcade', 'Finishgfl97.shp'), encoding='big5')
    names = [f[0] for f in r.fields[1:]]
    feats = []
    for sr in r.iterShapeRecords():
        rec = dict(zip(names, sr.record))
        pts = sr.shape.points
        parts = list(sr.shape.parts) + [len(pts)]
        rings = []
        for a, b in zip(parts[:-1], parts[1:]):
            xs, ys = to_wgs.transform([p[0] for p in pts[a:b]], [p[1] for p in pts[a:b]])
            rings.append([[r6(x), r6(y)] for x, y in zip(xs, ys)])
        if not rings:
            continue
        feats.append({
            'type': 'Feature',
            'geometry': {'type': 'Polygon', 'coordinates': rings},
            'properties': {
                'district': rec.get('GFL_ZONE', ''),
                'road': rec.get('GFL_ROAD', ''),
                'range': rec.get('GFL_RANGE', ''),
                'length': rec.get('GFL_LENGTH'),
                'done': roc_date(rec.get('GFL_FDATE', '')),
                'accessible': rec.get('Accessible', ''),
            },
        })
    write('arcades.json', {'type': 'FeatureCollection', 'features': feats})


# ── 積水模擬 ────────────────────────────────────────────────
KML = '{http://www.opengis.net/kml/2.2}'


def parse_coords(text):
    pts = []
    for tok in text.split():
        lng, lat = tok.split(',')[:2]
        pts.append((float(lng), float(lat)))
    return pts


def waterlog(scenario, fname):
    root = ET.parse(os.path.join(SRC, fname)).getroot()
    by_depth = defaultdict(list)
    for pm in root.iter(KML + 'Placemark'):
        depth = ''
        for sd in pm.iter(KML + 'SimpleData'):
            if sd.get('name') == 'depth':
                depth = (sd.text or '').strip()
        for poly in pm.iter(KML + 'Polygon'):
            outer = poly.find(f'{KML}outerBoundaryIs/{KML}LinearRing/{KML}coordinates')
            if outer is None:
                continue
            holes = [parse_coords(h.text) for h in poly.findall(f'{KML}innerBoundaryIs/{KML}LinearRing/{KML}coordinates')]
            g = make_valid(Polygon(parse_coords(outer.text), holes))
            # 約 2 公尺的簡化，檔案小很多、畫面上看不出差別
            g = g.simplify(0.00002, preserve_topology=True)
            if not g.is_empty:
                by_depth[depth].append(g)
    feats = []
    for depth, geoms in by_depth.items():
        for g in geoms:
            polys = [g] if isinstance(g, Polygon) else [p for p in getattr(g, 'geoms', []) if isinstance(p, Polygon)]
            for p in polys:
                m = mapping(p)
                m['coordinates'] = [[[r6(x), r6(y)] for x, y in ring] for ring in m['coordinates']]
                feats.append({'type': 'Feature', 'geometry': m, 'properties': {'depth': depth}})
    write(f'waterlog_{scenario}.json', {'type': 'FeatureCollection', 'features': feats})
    print(' depth classes:', sorted(by_depth))


if __name__ == '__main__':
    arcades()
    waterlog('788', 'wl_788.kml')
    waterlog('100', 'wl_100.kml')
    waterlog('130', 'wl_130.kml')
