
const parseDms = (dms) => {
  const list = dms.split(' ');
  if (list.length === 5) {
    const deg = parseInt(list[0], 10);
    const min = parseInt(list[2].slice(0, -1), 10);
    const sec = parseInt(list[3].slice(0, -1), 10);
    const dir = list[4];
    return deg + min/60 + sec/3600;
  }
  return null;
}

const flatten = arr => {
  let newArr = [];
  arr && arr.forEach(a => {
  	if (a instanceof Array) {
      newArr = newArr.concat(flatten(a));
    } else {
      newArr.splice(newArr.length, 0, a);
    }
  });
  return newArr;
}

const WIDTH = 1300;
const HEIGHT = 600;

const svg = d3
  .select('#map')
  .append('svg')
  .attr('width', '100%')
  .attr('height', '100%');

d3.csv('./gps.csv').then(data => {
  d3.json('./arrondissements.json').then(arrondissements => {
    const points = data.map(d => [parseDms(d.GPSLongitude), parseDms(d.GPSLatitude)]).filter(d => d && d[0] && d[1]);
    const pointsInParis = points.filter(d =>  arrondissements.some(a => d3.polygonContains(a.coordinates, d)));

    d3.json('./voie.json').then(voies => {
      const streets = [];
      voies.forEach(v => {
        if (typeof v.fields.geom.coordinates[0][0] === 'number') {
          streets.push(v.fields.geom.coordinates);
        } else if (v.fields.geom.coordinates[0][0] instanceof Array) {
          v.fields.geom.coordinates.forEach(v2 => {
            streets.push(v2);
          });
        }
      });

      const flatStreets = streets.map(s => flatten(s));

      const xValues = flatStreets.map(s => s[0]);
      const yValues = flatStreets.map(s => s[1]);

      const x = d3.scaleLinear()
        .domain(d3.extent(xValues))
        .range([0, WIDTH]);
      
      const y = d3.scaleLinear()
        .domain(d3.extent(yValues))
        .range([0, HEIGHT]);

      const line = d3.line()
        .x(d => {
          return x(d[0]);
        })
        .y(d => {
          return y(d[1]);
        });

      const streetsOnMap = svg
        .selectAll('.street')
        .data(streets)
        .enter()
        .append('path')
        .attr('class', 'street')
        .attr('d', line);

      const circles = svg
        .selectAll('circle')
        .data(pointsInParis)
        .enter()
        .append('circle')
        .attr('r', 1)
        .attr('cx', d => x(d[0]))
        .attr('cy', d => y(d[1]))
        .attr('fill', 'red');
    });
  });
});
