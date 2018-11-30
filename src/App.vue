<template>
  <div id='map'></div>
</template>

<script>
/* eslint-disable */

import * as d3 from "d3";
import polylabel from "polylabel";

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
      const condition1 = x => x < 0.03;
      const condition2 = x => x < 0.04;
      const condition3 = x => x < 0.07;
      const condition4 = x => x < 0.1;
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
            console.log(lowest.length, lower.length, lowish.length, low.length, proximities.length);
          }

          const value = mean;

          if (condition1(value)) return 1;
          else if (condition2(value)) return 0.75;
          else if (condition3(value)) return 0.5;
          else if (condition4(value)) return 0.25;
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
          console.log(d3.max(scoreExtent), d3.min(scoreExtent));
          console.log(errors);

          // const scaleValue = d3
          //   .scaleLog()
          //   .base(Math.E)
          //   .domain(scoreExtent)
          //   .range([0, 1]);

          // const scaledScores = streetScores.map(scaleValue);
          // console.log(
          //   scaledScores.reduce((a, b) => a + b, 0) / scaledScores.length
          // );

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

          let multiplier;
          const streetsOnMap = svg
            .selectAll(".street")
            .data(streets)
            .enter()
            .append("path")
            .attr("class", "street")
            .attr("d", line)
            .style("opacity", (d, i) => {
              multiplier = Math.random() >= 0.5 ? 1 : -1;
              return streetScores[i] + (multiplier * Math.random() / 4);
            });

          // const circles = svg
          //   .selectAll("circle")
          //   .data(pointsInParis)
          //   .enter()
          //   .append("circle")
          //   .attr("r", 2)
          //   .attr("cx", d => x(d[0]))
          //   .attr("cy", d => y(d[1]))
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
