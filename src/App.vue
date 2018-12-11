<template>
  <div id='map'></div>
</template>

<script>
/*
convert streets to graph:
- get intersections of street tronçons
- intersections become nodes
- each street (edge) has a weight


// FIRST PASS: get nodes
const nodes = [];

let line = Shapes.line(0, -10, 110, 110);

for s1 in array:
  for s2 in array:
    if (intersection(s1, s2)):
      nodes.push(new Point({
        id,
        position: [x, y],
        edges: [
          [1, 2], [3, 4],
          [5, 6], [7, 8],
        ]
      }));


// SECOND PASS: link edges to nodes

const edges = [];

nodes.forEach(n => {
  n.edges.forEach(n => {
    edges.push(new Edge({
      id,
      source: n.id,
      target: nodes.find(n2 => n2.)
    }))
  });
});
*/

/* eslint-disable */

import * as d3 from "d3";
import polylabel from "polylabel";
// import intersect from 'path-intersection';

let lib          = require('kld-intersections'),
    Point2D      = lib.Point2D,
    Intersection = lib.Intersection,
    Shapes       = lib.Shapes;

export default {
  name: "app",
  mounted() {
    const parseDms = dms => {
      const list = dms.split(" ");
      if (list.length === 5) {
        const deg = parseInt(list[0], 10);
        const min = parseInt(list[2].slice(0, -1), 10);
        const sec = parseInt(list[3].slice(0, -1), 10);
        const dir = list[4];
        return deg + min / 60 + sec / 3600;
      }
      return null;
    };

    const flatten = arr => {
      let newArr = [];
      arr &&
        arr.forEach(a => {
          if (a instanceof Array) {
            newArr = newArr.concat(flatten(a));
          } else {
            newArr.splice(newArr.length, 0, a);
          }
        });
      return newArr;
    };

    /* ************************************ */

    // for each street:
    //   for each photo:
    //     give score
    //   average score over all photos
    //   assign number

    // calculating individual score:
    // get centre point of street average of all points (or middle co-ordinate?)
    // get distance from all photos to average street point
    // get highest distance (half of x.domain, y.domain)
    // 0 = 0, 1 = highest distance; scale between => score

    const boisDeBoulogne = [
      [2.27322, 48.88222],
      [2.23306, 48.87861],
      [2.21589, 48.86438],
      [2.22482, 48.84608],
      [2.24988, 48.83964],
      [2.25636, 48.8458],
      [2.25835, 48.85076],
      [2.26164, 48.85543],
      [2.26571, 48.86256],
      [2.26981, 48.86824],
      [2.27362, 48.87272],
      [2.27733, 48.87654],
      [2.2788, 48.87745]
    ];
    const boisDeVincennes = [
      [2.48797, 48.84981],
      [2.41605, 48.84461],
      [2.41291, 48.83535],
      [2.40912, 48.83348],
      [2.40576, 48.8321],
      [2.40073, 48.82889],
      [2.39991, 48.82642],
      [2.46463, 48.80721],
      [2.47111, 48.81337],
      [2.4731, 48.81833],
      [2.47639, 48.823],
      [2.48046, 48.83014],
      [2.48456, 48.83582],
      [2.48837, 48.8403],
      [2.49208, 48.84412],
      [2.49355, 48.84504]
    ];

    const averageCoords = array =>
      array
        .reduce((acc, val) => [acc[0] + val[0], acc[1] + val[1]], [0, 0])
        .map(x => x / array.length);

    const distanceBetweenCoords = (co1, co2) =>
      Math.sqrt(Math.pow(co2[0] - co1[0], 2) + Math.pow(co2[1] - co1[1], 2));

    const errors = [];

    // bracket distances into blocks?
    const algo = (streets, photos) => {
      let proximities, midpoint;
      const condition1 = x => x < 0.02;
      const condition2 = x => x < 0.025;
      const condition3 = x => x < 0.03;
      const condition4 = x => x < 0.035;
      const condition5 = x => x < 0.04;
      const condition6 = x => x < 0.045;
      const condition7 = x => x < 0.05;
      const condition8 = x => x < 0.055;
      const condition9 = x => x < 0.06;
      const condition10 = x => x < 0.065;
      const condition11 = x => x < 0.07;
      const condition12 = x => x < 0.075;
      const condition13 = x => x < 0.08;
      const condition14 = x => x < 0.085;
      const condition15 = x => x < 0.09;
      const condition16= x => x < 0.095;
      const condition17 = x => x < 0.1;
      return streets
        .map((street, streetIndex) => {
          midpoint = polylabel([street], 1.0);
          proximities = photos.map(photo => distanceBetweenCoords(midpoint, photo));

          const min = d3.min(proximities);
          const mean = d3.mean(proximities);
          const max = d3.min(proximities);

          if (streetIndex < 100) {
            const lowest = proximities.filter(condition1);
            const lower = proximities.filter(condition2);
            const lowish = proximities.filter(condition3);
            const low = proximities.filter(condition4);
            // console.log(lowest.length, lower.length, lowish.length, low.length, proximities.length);
          }

          const value = mean;

          if (condition1(value)) return 1;
          else if (condition2(value)) return 0.95;
          else if (condition3(value)) return 0.9;
          else if (condition4(value)) return 0.85;
          else if (condition5(value)) return 0.75;
          else if (condition6(value)) return 0.7;
          else if (condition7(value)) return 0.65;
          else if (condition8(value)) return 0.6;
          else if (condition9(value)) return 0.55;
          else if (condition10(value)) return 0.5;
          else if (condition11(value)) return 0.4;
          else if (condition12(value)) return 0.35;
          else if (condition13(value)) return 0.3;
          else if (condition14(value)) return 0.25;
          else if (condition15(value)) return 0.2;
          else if (condition16(value)) return 0.15;
          else if (condition17(value)) return 0.1;
          return 0;

          // console.log(d3.min(proximities));
          // return proximities.reduce((a, b) => a + b, 0) / proximities.length;
        })
        .filter(x => x);
    };

    /* ************************************ */

    const WIDTH = 1000;
    const HEIGHT = 600;

    const svg = d3
      .select("#map")
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%");

    d3.csv("/gps.csv").then(data => {
      d3.json("/arrondissements.json").then(arrondissements => {
        const points = data
          .map(d => [parseDms(d.GPSLongitude), parseDms(d.GPSLatitude)])
          .filter(d => d && d[0] && d[1]);
        const pointsInParis = points.filter(
          d =>
            arrondissements.some(a => d3.polygonContains(a.coordinates, d)) &&
            !d3.polygonContains(boisDeBoulogne, d) &&
            !d3.polygonContains(boisDeVincennes, d)
        );

        d3.json("/troncon_voie.json").then(voies => {
          let streets = [];
          voies.forEach(v => {
            if (typeof v.fields.geom.coordinates[0][0] === "number") {
              streets.push(v.fields.geom.coordinates);
            } else if (v.fields.geom.coordinates[0][0] instanceof Array) {
              v.fields.geom.coordinates.forEach(v2 => {
                streets.push(v2);
              });
            }
          });

          streets = streets.filter(
            street =>
              !street.some(d => d3.polygonContains(boisDeBoulogne, d)) &&
              !street.some(d => d3.polygonContains(boisDeVincennes, d))
          );

          const flatStreets = streets.map(s => flatten(s));

          const xValuesExtent = d3.extent(flatStreets.map(s => s[0]));
          const yValuesExtent = d3.extent(flatStreets.map(s => s[1]));
          
          const streetScores = algo(streets, pointsInParis);
          const scoreExtent = d3.extent(streetScores);

          // D3 ACTUAL SCALES
          const x = d3
            .scaleLinear()
            .domain(xValuesExtent)
            .range([0, WIDTH]);

          const y = d3
            .scaleLinear()
            .domain(yValuesExtent)
            .range([0, HEIGHT]);

          const line = d3
            .line()
            .x(d => x(d[0]))
            .y(d => y(d[1]));

          
          const streetLines = streets.map(s => ({ coords: s, poly: s.map(co => new Point2D(...co)) }));


          // BUILD BASIC NODE ARRAY
          let result;
          const nodes = [];
          streetLines.slice(0, 1000).forEach((s1, s1i) => {
            streetLines.slice(0, 1000).forEach((s2, s2i) => {
              if (s1i !== s2i) {
                result = Intersection.intersectPolylinePolyline(s1.poly, s2.poly);
                if (result.points.length) {
                  result.points.forEach(t => {
                    nodes.push({
                      x: t.x,
                      y: t.y,
                      edges: [
                        { id: s1i, score: streetScores[s1i], travelled: false },
                        { id: s2i, score: streetScores[s2i], travelled: false },
                      ],
                    });
                  });
                }
              }
            });
          });

          // ADD NODE IDS
          nodes.forEach((n, nIndex) => { n.id = nIndex; });


          // NORMALIZE NODES
          // merge nodes with same x/y => concat edges
          // dedupe nodeIds ('0-121' / '121-0')


          // HYDRATE COMPLETE GRAPH
          const graph = nodes.map((n, nIndex) => ({
            ...n,
            id: nIndex,
            edges: n.edges.map(e => ({
              ...e,
              nodeIds: nodes.filter(fn => fn.edges.some(fe => fe.id === e.id)).map(fn => fn.id),
            })),
          }));

          // @TODO improve
          const decideToTravel = edge => true; // edge.score > 0.5;


          const drawEdge = edge => {
            if (graph[edge.nodeIds[0]].x !== graph[edge.nodeIds[1]].x) {
              debugger;
            }
            svg.append('line')
              .attr('x1', x(graph[edge.nodeIds[0]].x))
              .attr('y1', y(graph[edge.nodeIds[0]].y))
              .attr('x2', x(graph[edge.nodeIds[1]].x))
              .attr('y2', y(graph[edge.nodeIds[1]].y))
              .attr('stroke', 'black')
              .attr('stroke-width', '20px');
          };

          const splitPath = node => {
            console.log(`In splitPath for node ID ${node.id}`);
            node.edges.forEach(e => {
              if (!e.travelled) {
                if (decideToTravel(e)) {
                  window.setTimeout(() => {
                    drawEdge(e);
                    const nodesExceptPresent = e.nodeIds.filter(id => id !== node.id);
                    const foundNodes = nodesExceptPresent.map(id => graph.find(gn => gn.id === id));
                    foundNodes.forEach(splitPath);
                  }, 500);
                }
                e.travelled = true;
              }
            });
          };

          // @TODO starter nodes

          const streetsOnMap = svg
            .selectAll(".street")
            .data(streets)
            .enter()
            .append("path")
            .attr("class", "street")
            .attr("d", line)
            .style("opacity", "0.05");

          // START DRAWING!
          const starterNodes = [graph[5], graph[9], graph[19], graph[29], graph[39], graph[49]];

          const circles = svg
            .selectAll("circle")
            .data(starterNodes)
            .enter()
            .append("circle")
            .attr("r", 2)
            .attr("cx", d => x(d.x))
            .attr("cy", d => y(d.y))
            .attr("fill", "red");

          starterNodes.forEach(starter => splitPath(starter));

          // const circles = svg
          //   .selectAll("circle")
          //   .data(nodes)
          //   .enter()
          //   .append("circle")
          //   .attr("r", 2)
          //   .attr("cx", d => x(d.x))
          //   .attr("cy", d => y(d.y))
          //   .attr("fill", "red");
        });
      });
    });
  }
};
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  padding: 0;
  margin: 0;
  height: 100vh;
  width: 100vw;
}

#map {
  width: 100%;
  height: 80%;
  transform: rotate(180deg) scaleX(-1);
  transform-origin: 50% 50%;
}

#map path {
  stroke-width: 1;
  stroke: black;
  fill: none;
}

#map circle {
  fill: red;
  stroke: none;
}
</style>
