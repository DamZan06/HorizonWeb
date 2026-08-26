const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const gpxPath = path.join(root, 'data', 'route', 'Horizon.gpx');
const outputPath = path.join(root, 'data', 'route', 'horizon-route.geojson');
const metaPath = path.join(root, 'data', 'route', 'horizon-route-meta.json');

function parseGpxToLineString(gpxText) {
  const matches = [...gpxText.matchAll(/<trkpt[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*>([\s\S]*?)<\/trkpt>/g)];
  return matches.map((match) => { const elevation = /<ele>([^<]+)<\/ele>/.exec(match[3]); return [Number(match[2]), Number(match[1]), elevation ? Number(elevation[1]) : null]; })
    .filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]));
}

function distanceKm(a, b) { const rad=Math.PI/180,dLat=(b[1]-a[1])*rad,dLon=(b[0]-a[0])*rad;const h=Math.sin(dLat/2)**2+Math.cos(a[1]*rad)*Math.cos(b[1]*rad)*Math.sin(dLon/2)**2;return 12742.0176*Math.asin(Math.sqrt(h)); }
function buildMeta(points) {
  let distance=0,gain=0; const bounds={south:Infinity,west:Infinity,north:-Infinity,east:-Infinity};
  // Ignore sub-metre GPX altitude jitter while retaining genuine climbing.
  points.forEach((point,index)=>{bounds.south=Math.min(bounds.south,point[1]);bounds.north=Math.max(bounds.north,point[1]);bounds.west=Math.min(bounds.west,point[0]);bounds.east=Math.max(bounds.east,point[0]);if(index){distance+=distanceKm(points[index-1],point);const delta=point[2]-points[index-1][2];if(Number.isFinite(delta)&&delta>.75&&delta<500)gain+=delta;}});
  const loc=(p)=>({lat:p[1],lng:p[0]});
  return { generatedFrom:'Horizon.gpx', pointCount:points.length, distanceKm:Number(distance.toFixed(3)), elevationGainM:Math.round(gain), start:loc(points[0]), finish:loc(points.at(-1)), bounds };
}

function buildGeoJsonFromPoints(points) {
  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {
        name: 'HORIZON route',
        source: 'Horizon.gpx'
      },
      geometry: {
        type: 'LineString',
        coordinates: points
      }
    }]
  };
}

function main() {
  const gpxText = fs.readFileSync(gpxPath, 'utf8');
  const coordinates = parseGpxToLineString(gpxText);

  if (!coordinates.length) {
    throw new Error('No GPX track points found in data/route/Horizon.gpx');
  }

  const geojson = buildGeoJsonFromPoints(coordinates);
  fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
  const meta=buildMeta(coordinates); fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
  console.log(`Wrote ${coordinates.length} route points (${meta.distanceKm} km) and metadata.`);
}

main();
