"""Generates src/presentation/components/brazilMapData.ts from @svg-maps/brazil (CC BY 4.0).

Usage (from web_app/):
    npm pack @svg-maps/brazil@2.0.0 && tar -xzf svg-maps-brazil-2.0.0.tgz
    python3 scripts/generate_brazil_map.py package/index.js src/presentation/components/brazilMapData.ts
"""
import json, re, sys

src, dst = sys.argv[1], sys.argv[2]
text = open(src, encoding='utf-8').read()
data = json.loads(text[text.index('{'):text.rindex('}') + 1])

def bbox(path):
    # Only relative "m", implicit relative lineto and "z" are used by this map
    tokens = re.findall(r'[mMzZ]|-?\d*\.?\d+(?:e-?\d+)?', path)
    x = y = 0.0
    start = (0.0, 0.0)
    xs, ys = [], []
    i = 0
    while i < len(tokens):
        t = tokens[i]
        if t in 'zZ':
            x, y = start
            i += 1
            continue
        if t == 'M':
            raise SystemExit('absolute moveto not supported')
        if t == 'm':
            i += 1
            x += float(tokens[i]); y += float(tokens[i + 1]); i += 2
            start = (x, y)
        else:
            x += float(tokens[i]); y += float(tokens[i + 1]); i += 2
        xs.append(x); ys.append(y)
    return [round(min(xs), 1), round(min(ys), 1), round(max(xs) - min(xs), 1), round(max(ys) - min(ys), 1)]

lines = [
    '// Generated from @svg-maps/brazil 2.0.0 by Victor Cazanave, based on the MapSVG map',
    '// (https://mapsvg.com/maps/brazil), licensed under CC BY 4.0: https://creativecommons.org/licenses/by/4.0/',
    '// Do not edit by hand. Changes: only the paths and their bounding boxes are kept.',
    '',
    'export interface MapState {',
    '  /** Lowercase state code, the same used by BRAZILIAN_STATES. */',
    '  readonly code: string',
    '  readonly path: string',
    '  /** [x, y, width, height] in viewBox units. */',
    '  readonly box: readonly [number, number, number, number]',
    '}',
    '',
    f"export const BRAZIL_MAP_VIEW_BOX = '{data['viewBox']}'",
    '',
    'export const BRAZIL_MAP_STATES: readonly MapState[] = [',
]
for loc in sorted(data['locations'], key=lambda l: l['id']):
    b = bbox(loc['path'])
    lines.append(f"  {{ code: '{loc['id']}', box: [{b[0]}, {b[1]}, {b[2]}, {b[3]}], path: '{loc['path']}' }},")
lines += [']', '']
open(dst, 'w', encoding='utf-8').write('\n'.join(lines))
for loc in sorted(data['locations'], key=lambda l: max(bbox(l['path'])[2:])):
    print(loc['id'], bbox(loc['path']))
