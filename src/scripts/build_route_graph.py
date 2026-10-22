"""
建置「涼徑規劃」用的臺北市步行路網（public/data/route/）。網站本身不跑這支，
資料更新時在本機重跑即可（全市一次約十多分鐘）。

需要的套件：osmium（pyosmium）、shapely、pyproj（pip install osmium shapely pyproj）

用法：
  python3 src/scripts/build_route_graph.py <原始資料資料夾>

原始資料資料夾裡要有：
  taiwan.osm.pbf     Geofabrik 臺灣 OpenStreetMap 檔（download.geofabrik.de/asia/taiwan.html）
  trees.csv          臺北市行道樹（tppkl.blob.core.windows.net/blobfs/TaipeiTree.csv）
  lamps.csv          臺北市路燈（與 process_city_layers.py 同一份）
  arcade/Finishgfl97.shp  臺北市騎樓整平路段（與 process_city_layers.py 同一份）

每條路段算三個「舒適指標」，前端依情境挑一個來加權：
  shade[季][時]  遮蔭比例：沿路每 12 公尺取一點，判斷該點是否落在
                  (1) 行道樹樹冠內（樹位 4 公尺內）、(2) 樹林／森林範圍內、
                  (3) 建築物陰影內——往太陽方向拉一條射線，碰到的建築若高過射線在該處的高度就算有陰影。
                  建築高度：height 標籤 → building:levels × 3.2 公尺 → 都沒有就用 12 公尺（和日照陰影圖層一致）。
                  季節取兩個代表日：7/15（夏）與 10/15（春秋），時段 7–17 點整點，共 22 組。
  cover          可遮雨比例：取樣點 12 公尺內有騎樓整平路段，或路段本身標了 covered／隧道／室內通道。
  lit            照明比例：取樣點 20 公尺內有路燈，或路段標了 lit=yes。

輸出依 0.01° 方格切檔（以路段中點歸格），前端只載入起終點附近的格子：
  public/data/route/index.json        { cells: [...], hours: [7..17], seasons: ['summer','autumn'] }
  public/data/route/<lat>_<lng>.json  { n: {節點id: [lat5, lng5]}, e: [[u, v, 長度m, 幾何, shade(22), cover, lit, 類別], ...] }
    幾何：路段中間點（不含兩端節點），以 1e-5 度整數差分編碼，省空間。
    shade／cover／lit：0–100 的整數百分比。
    類別：0 一般道路、1 人行道／步道／行人徒步區、2 階梯、3 大馬路（primary 以上，走起來較不舒服）。
"""
import csv
import json
import math
import os
import sys
from collections import defaultdict
from datetime import datetime, timedelta, timezone

import numpy as np
import osmium
import shapely
from pyproj import Transformer
from shapely.geometry import LineString, Point, Polygon, MultiPolygon
from shapely import wkb

SRC = sys.argv[1] if len(sys.argv) > 1 else '.'
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'data', 'route')
os.makedirs(OUT, exist_ok=True)

# 平面計算用 TWD97 TM2（公尺）
to_tm = Transformer.from_crs('EPSG:4326', 'EPSG:3826', always_xy=True)
to_wgs = Transformer.from_crs('EPSG:3826', 'EPSG:4326', always_xy=True)

WALK_HIGHWAYS = {
    'footway': 1, 'pedestrian': 1, 'path': 1, 'living_street': 1, 'corridor': 1, 'cycleway': 1, 'track': 0,
    'steps': 2,
    'residential': 0, 'service': 0, 'unclassified': 0, 'tertiary': 0, 'tertiary_link': 0,
    'secondary': 0, 'secondary_link': 0,
    'primary': 3, 'primary_link': 3, 'trunk': 3, 'trunk_link': 3,
}
HOURS = list(range(7, 18))
SEASON_DATES = {'summer': (7, 15), 'autumn': (10, 15)}
SAMPLE_STEP = 12.0
TREE_R = 4.0
COVER_R = 12.0
LAMP_R = 20.0
DEFAULT_H = 12.0
LEVEL_H = 3.2
MAX_SHADOW = 150.0  # 射線最長 150 公尺（再遠的建築遮蔭意義不大）


def log(*a):
    print(datetime.now().strftime('%H:%M:%S'), *a, flush=True)


# ── 1. 臺北市界 ─────────────────────────────────────────────
def taipei_boundary(pbf):
    wkbf = osmium.geom.WKBFactory()
    fp = osmium.FileProcessor(pbf).with_areas(osmium.filter.TagFilter(('boundary', 'administrative')))
    for obj in fp:
        if obj.is_area() and obj.tags.get('admin_level') == '4' and obj.tags.get('name') == '臺北市':
            g = wkb.loads(wkbf.create_multipolygon(obj), hex=True)
            return g
    raise SystemExit('找不到臺北市界（relation name=臺北市, admin_level=4）')


# ── 2. 讀 OSM：步行路、建築、樹林 ───────────────────────────
def building_height(tags):
    h = tags.get('height')
    if h:
        try:
            return float(h.replace('m', '').strip())
        except ValueError:
            pass
    lv = tags.get('building:levels')
    if lv:
        try:
            return float(lv) * LEVEL_H
        except ValueError:
            pass
    return DEFAULT_H


def read_osm(pbf, bbox):
    w, s, e, n = bbox
    ways, buildings, woods = [], [], []
    fp = osmium.FileProcessor(pbf).with_locations().with_filter(osmium.filter.KeyFilter('highway', 'building', 'natural', 'landuse'))
    for obj in fp:
        if not obj.is_way():
            continue
        try:
            coords = [(nd.lon, nd.lat) for nd in obj.nodes]
            ids = [nd.ref for nd in obj.nodes]
        except osmium.InvalidLocationError:
            continue
        if not coords:
            continue
        lon0, lat0 = coords[0]
        if not (w <= lon0 <= e and s <= lat0 <= n):
            continue
        t = obj.tags
        hw = t.get('highway')
        if hw in WALK_HIGHWAYS:
            if t.get('access') in ('private', 'no') or t.get('foot') == 'no':
                continue
            if hw in ('trunk', 'trunk_link') and t.get('sidewalk') in (None, 'no', 'none'):
                continue  # 沒標人行道的快速道路不給走
            ways.append({
                'ids': ids, 'coords': coords, 'cls': WALK_HIGHWAYS[hw],
                'covered': t.get('covered') in ('yes', 'arcade') or t.get('tunnel') in ('yes', 'building_passage') or t.get('indoor') == 'yes' or hw == 'corridor',
                'lit': t.get('lit') in ('yes', '24/7', 'automatic'),
            })
        elif 'building' in t and len(coords) >= 4 and ids[0] == ids[-1]:
            buildings.append((coords, building_height(t)))
        elif (t.get('natural') == 'wood' or t.get('landuse') == 'forest') and len(coords) >= 4 and ids[0] == ids[-1]:
            woods.append(coords)
    return ways, buildings, woods


# ── 3. 切成路段（在路口切開） ───────────────────────────────
def build_edges(ways, city_tm):
    use = defaultdict(int)
    for wy in ways:
        for i, nid in enumerate(wy['ids']):
            use[nid] += 2 if i in (0, len(wy['ids']) - 1) else 1
    node_xy = {}
    edges = []
    for wy in ways:
        ids, coords = wy['ids'], wy['coords']
        xs, ys = to_tm.transform([c[0] for c in coords], [c[1] for c in coords])
        start = 0
        for i in range(1, len(ids)):
            if i == len(ids) - 1 or use[ids[i]] > 1:
                seg_ids = ids[start:i + 1]
                if len(seg_ids) >= 2 and seg_ids[0] != seg_ids[-1]:
                    pts = list(zip(xs[start:i + 1], ys[start:i + 1]))
                    ll = coords[start:i + 1]
                    edges.append({'u': seg_ids[0], 'v': seg_ids[-1], 'xy': pts, 'll': ll, 'cls': wy['cls'],
                                  'covered': wy['covered'], 'lit': wy['lit']})
                    node_xy[seg_ids[0]] = ll[0]
                    node_xy[seg_ids[-1]] = ll[-1]
                start = i
    # 只留中點在臺北市界內的路段
    mids = shapely.points([((e['xy'][0][0] + e['xy'][-1][0]) / 2, (e['xy'][0][1] + e['xy'][-1][1]) / 2) for e in edges])
    inside = shapely.contains(city_tm, mids)
    edges = [e for e, ok in zip(edges, inside) if ok]
    return edges, node_xy


def samples_of(xy):
    line = LineString(xy)
    L = line.length
    n = max(1, int(L // SAMPLE_STEP))
    ds = [(k + 0.5) * L / n for k in range(n)]
    return L, [line.interpolate(d) for d in ds]


# ── 4. 太陽位置（簡化 NOAA 公式，台北時間） ─────────────────
def sun_pos(dt_local, lat, lng):
    dt = dt_local.astimezone(timezone.utc)
    doy = dt.timetuple().tm_yday
    hour = dt.hour + dt.minute / 60
    g = 2 * math.pi / 365 * (doy - 1 + (hour - 12) / 24)
    decl = 0.006918 - 0.399912 * math.cos(g) + 0.070257 * math.sin(g) - 0.006758 * math.cos(2 * g) + 0.000907 * math.sin(2 * g) - 0.002697 * math.cos(3 * g) + 0.00148 * math.sin(3 * g)
    eqt = 229.18 * (0.000075 + 0.001868 * math.cos(g) - 0.032077 * math.sin(g) - 0.014615 * math.cos(2 * g) - 0.040849 * math.sin(2 * g))
    tst = hour * 60 + eqt + 4 * lng
    ha = math.radians(tst / 4 - 180)
    la = math.radians(lat)
    cos_z = math.sin(la) * math.sin(decl) + math.cos(la) * math.cos(decl) * math.cos(ha)
    zen = math.acos(max(-1, min(1, cos_z)))
    alt = math.pi / 2 - zen
    az = math.atan2(math.sin(ha), math.cos(ha) * math.sin(la) - math.tan(decl) * math.cos(la))  # 由南起算，往西為正
    az_from_north = (math.degrees(az) + 180) % 360
    return alt, math.radians(az_from_north)


def main():
    pbf = os.path.join(SRC, 'taiwan.osm.pbf')
    log('讀臺北市界')
    city = taipei_boundary(pbf)
    w, s, e, n = city.bounds
    city_tm = shapely.transform(city, lambda a: np.column_stack(to_tm.transform(a[:, 0], a[:, 1])))
    shapely.prepare(city_tm)

    log('讀 OSM 步行路、建築、樹林')
    ways, buildings, woods = read_osm(pbf, (w - 0.01, s - 0.01, e + 0.01, n + 0.01))
    log(f'  步行路 {len(ways)}、建築 {len(buildings)}、樹林 {len(woods)}')

    edges, node_ll = build_edges(ways, city_tm)
    log(f'  路段 {len(edges)}')

    # 取樣點
    sample_owner, sample_pts = [], []
    for i, ed in enumerate(edges):
        L, pts = samples_of(ed['xy'])
        ed['len'] = L
        ed['ns'] = len(pts)
        sample_owner.extend([i] * len(pts))
        sample_pts.extend(pts)
    sample_owner = np.array(sample_owner)
    P = np.array([[p.x, p.y] for p in sample_pts])
    pts_geom = shapely.points(P)
    log(f'  取樣點 {len(P)}')

    def per_edge(mask):
        tot = np.bincount(sample_owner, weights=mask.astype(float), minlength=len(edges))
        cnt = np.bincount(sample_owner, minlength=len(edges))
        return np.round(100 * tot / np.maximum(cnt, 1)).astype(int)

    # 樹：行道樹 + 樹林
    log('樹蔭')
    tx, ty = [], []
    with open(os.path.join(SRC, 'trees.csv'), encoding='utf-8-sig') as f:
        for row in csv.DictReader(f):
            try:
                tx.append(float(row['TWD97X'])); ty.append(float(row['TWD97Y']))
            except (KeyError, ValueError, TypeError):
                pass
    tree_buf = shapely.buffer(shapely.points(np.column_stack([tx, ty])), TREE_R, quad_segs=4)
    wood_polys = [Polygon(np.column_stack(to_tm.transform([c[0] for c in cs], [c[1] for c in cs]))) for cs in woods]
    tree_tree = shapely.STRtree(list(tree_buf) + [p for p in wood_polys if p.is_valid])
    hit = tree_tree.query(pts_geom, predicate='intersects')
    tree_mask = np.zeros(len(P), bool)
    tree_mask[np.unique(hit[0])] = True
    log(f'  行道樹 {len(tx)}，樹下取樣點 {tree_mask.mean():.1%}')

    # 建築陰影
    log('建築陰影')
    bpolys, bh = [], []
    for cs, h in buildings:
        xs, ys = to_tm.transform([c[0] for c in cs], [c[1] for c in cs])
        p = Polygon(zip(xs, ys))
        if p.is_valid and p.area > 4:
            bpolys.append(p); bh.append(h)
    bh = np.array(bh)
    btree = shapely.STRtree(bpolys)
    bpolys_arr = np.array(bpolys, dtype=object)
    shade = {}
    clat, clng = (s + n) / 2, (w + e) / 2
    tz = timezone(timedelta(hours=8))
    for season, (mo, dy) in SEASON_DATES.items():
        for hr in HOURS:
            alt, az = sun_pos(datetime(2026, mo, dy, hr, 0, tzinfo=tz), clat, clng)
            if alt <= math.radians(2):
                m = np.ones(len(P), bool)  # 太陽在地平線附近：當作全陰
            else:
                tan_a = math.tan(alt)
                L = min(MAX_SHADOW, bh.max() / tan_a)
                dx, dy_ = math.sin(az) * L, math.cos(az) * L
                rays = shapely.linestrings(np.stack([P, P + [dx, dy_]], axis=1))
                si, bi = btree.query(rays, predicate='intersects')
                # 射線碰到建築的最近距離 → 該處射線高度 = 距離 × tan(高度角)；建築比它高就擋住太陽
                inter = shapely.intersection(rays[si], bpolys_arr[bi])
                dist = shapely.distance(pts_geom[si], inter)
                blocked = bh[bi] > dist * tan_a
                m = np.zeros(len(P), bool)
                m[si[blocked]] = True
            m |= tree_mask
            shade[(season, hr)] = per_edge(m)
            log(f'  {season} {hr:02d}:00 太陽高度 {math.degrees(alt):.0f}° 陰影 {m.mean():.0%}')

    # 遮雨：騎樓整平路段 + 標了 covered 的路
    log('遮雨與照明')
    import shapefile
    r = shapefile.Reader(os.path.join(SRC, 'arcade', 'Finishgfl97.shp'), encoding='big5')
    arc = [Polygon(sh.points) for sh in r.shapes() if len(sh.points) >= 4]
    arc_tree = shapely.STRtree([a for a in arc if a.is_valid])
    near = arc_tree.query(pts_geom, predicate='dwithin', distance=COVER_R)
    cover_mask = np.zeros(len(P), bool)
    cover_mask[np.unique(near[0])] = True
    covered_edges = np.array([ed['covered'] for ed in edges])
    cover = np.where(covered_edges, 100, per_edge(cover_mask))

    lx, ly = [], []
    with open(os.path.join(SRC, 'lamps.csv'), encoding='utf-8-sig') as f:
        for row in csv.DictReader(f, skipinitialspace=True):
            try:
                lx.append(float(row['TWD97X'])); ly.append(float(row['TWD97Y']))
            except (KeyError, ValueError, TypeError):
                pass
    lamp_tree = shapely.STRtree(shapely.points(np.column_stack([lx, ly])))
    near = lamp_tree.query(pts_geom, predicate='dwithin', distance=LAMP_R)
    lit_mask = np.zeros(len(P), bool)
    lit_mask[np.unique(near[0])] = True
    lit_edges = np.array([ed['lit'] for ed in edges])
    lit = np.where(lit_edges, 100, per_edge(lit_mask))
    log(f'  遮雨路段平均 {cover.mean():.0f}%、照明 {lit.mean():.0f}%')

    # 輸出
    log('輸出方格檔')
    cells = defaultdict(lambda: {'n': {}, 'e': []})
    keys = [(s_, h) for s_ in SEASON_DATES for h in HOURS]
    # OSM 節點編號動輒 10 位數，換成從 0 起算的流水號以縮小檔案
    nid_map = {}
    for ed in edges:
        for k in ('u', 'v'):
            ed[k] = nid_map.setdefault(ed[k], len(nid_map))
    for i, ed in enumerate(edges):
        a, b = ed['ll'][0], ed['ll'][-1]
        mlat, mlng = (a[1] + b[1]) / 2, (a[0] + b[0]) / 2
        key = f'{math.floor(mlat * 100)}_{math.floor(mlng * 100)}'
        c = cells[key]
        for nid, ll in ((ed['u'], a), (ed['v'], b)):
            c['n'][nid] = [round(ll[1], 5), round(ll[0], 5)]
        mid = ed['ll'][1:-1]
        enc, plat, plng = [], round(a[1] * 1e5), round(a[0] * 1e5)
        for lng_, lat_ in mid:
            qa, qo = round(lat_ * 1e5), round(lng_ * 1e5)
            enc += [qa - plat, qo - plng]
            plat, plng = qa, qo
        c['e'].append([ed['u'], ed['v'], round(ed['len'], 1), enc,
                       [int(shade[k][i]) for k in keys], int(cover[i]), int(lit[i]), ed['cls']])
    for key, c in cells.items():
        with open(os.path.join(OUT, f'{key}.json'), 'w') as f:
            json.dump(c, f, separators=(',', ':'))
    with open(os.path.join(OUT, 'index.json'), 'w') as f:
        json.dump({'cells': sorted(cells), 'hours': HOURS, 'seasons': list(SEASON_DATES),
                   'built': datetime.now(tz).strftime('%Y-%m-%d')}, f, ensure_ascii=False)
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    log(f'完成：{len(cells)} 格、{len(edges)} 路段、共 {total / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
