const _ = require("lodash");
const { readJson, writeJson } = require("./readWrite");

// The stop_times.txt file contains the relationship between trips and stops.
// Without this, stops that belong to a certain route cannot be determined.
// The problem is that this file is huge and contains a lot of data that is not needed.
// This script reads the stop_times.txt file and creates a new file that contains only the data needed.
// It is run once while the stop_times.txt file is in the same directory.
// The stop_times.txt file is then deleted.

// Data is then read from the routeStops.json file.

function getRoutesWithShapeIds(dir) {
  const routes = readJson(`${dir}/routes.json`);
  const trips = readJson(`${dir}/trips.json`);
  const routesWithShapeIds = routes.map((route) => {
    const routeShapeIds = trips
      .filter((trip) => trip.route_id === route.route_id)
      .map((trip) => trip.shape_id);
    return {
      route_id: route.route_id,
      shape_ids: _.uniq(routeShapeIds),
    };
  });

  return routesWithShapeIds;
}

function addRoutesWithShapeIds(dir) {
  console.log(`Adding routesWithShapeIds to ${dir}`);
  const routesWithShapeIds = getRoutesWithShapeIds(dir);
  writeJson(`${dir}/routesWithShapeIds.json`, routesWithShapeIds);
}

// const DIR = "data/parsed/septaGtfs";
// addRoutesWithShapeIds(DIR);

module.exports = {
  addRoutesWithShapeIds,
};

// const trips = readJson("data/parsed/septaGtfs/trips.json");
// console.log(trips.length);
// console.log(_.uniqBy(trips, "shape_id").length);
