const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const gpxPath = path.join(root, 'data', 'Horizon.gpx');
const outputPath = path.join(root, 'data', 'horizon-route.geojson');

function parseGpxToLineString(gpxText) {
  const matches = [...gpxText.matchAll(/<trkpt[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*>/g)];
  const coordinates = matches.map((match) => [Number(match[2]), Number(match[1])]);

  return coordinates.filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]));
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
    throw new Error('No GPX track points found in data/Horizon.gpx');
  }

  const geojson = buildGeoJsonFromPoints(coordinates);
  fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));
  console.log(`Wrote ${coordinates.length} route points to ${path.relative(root, outputPath)}`);
}

main();
