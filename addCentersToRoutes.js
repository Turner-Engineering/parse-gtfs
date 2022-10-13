const _ = require("lodash");
const { readJson, writeJson } = require("./readWrite");

async function getRoutesWithTripIds(dir) {
  const routes = await readJson(`${dir}/routes.json`);
  const trips = await readJson(`${dir}/trips.json`);
  const routesWithTripIds = routes.map((route) => {
    const routeTripIds = trips
      .filter((trip) => trip.route_id === route.route_id)
      .map((trip) => trip.trip_id);
    return {
      route_id: route.route_id,
      trip_ids: routeTripIds,
    };
  });
  return routesWithTripIds;
}

async function getTripsWithStopIds(dir) {
  const stopTimes = await readJson(`${dir}/stop_times.json`);
  const groupedStopTimes = _.groupBy(stopTimes, "trip_id");
  const tripsWithStopIds = Object.keys(groupedStopTimes).map((trip_id) => {
    const stopTimes = groupedStopTimes[trip_id];
    const stop_ids = stopTimes.map((stopTime) => stopTime.stop_id);
    return {
      trip_id,
      stop_ids,
    };
  });
  return tripsWithStopIds;
}

function getStopIds(routes, trips) {
  const routeStopIds = routes.trip_ids.map((trip_id) => {
    const tripStopIds = trips.find(
      (trip) => trip.trip_id === trip_id
    )?.stop_ids;
    return tripStopIds || [];
  });
  const stop_ids = _.uniq(_.flatten(routeStopIds));
  return stop_ids;
}

async function getRoutes(dir) {
  const stopPropsToPick = ["stop_id", "stop_name", "stop_lat", "stop_lon"];
  const stops = await readJson(`${dir}/stops.json`);
  const routesWithTripIds = await getRoutesWithTripIds(dir);
  const tripsWithStopIds = await getTripsWithStopIds(dir);
  const routesWithStops = routesWithTripIds.map((route) => {
    const stop_ids = getStopIds(route, tripsWithStopIds);
    const routeStops = stops
      .filter((stop) => stop_ids.includes(stop.stop_id))
      .map((stop) => _.pick(stop, stopPropsToPick));
    return {
      route_id: route.route_id,
      stops: routeStops,
    };
  });
  return routesWithStops;
}

async function addCenters(dir) {
  console.log(`Adding routeCenters to ${dir}`);
  const routes = await readJson(`${dir}/routes.json`);
  await writeJson(`${dir}/RAW_routes.json`, routes);
  const routesWithStops = await readJson(`${dir}/routesWithStops.json`);
  const newRoutes = routes.map((route) => {
    const routeWithStops = routesWithStops.find(
      (routeWithStops) => routeWithStops.route_id === route.route_id
    );
    const stops = routeWithStops?.stops || [];
    const stopLats = stops.map((stop) => stop.stop_lat);
    const stopLons = stops.map((stop) => stop.stop_lon);
    const routeLat = (Math.max(...stopLats) + Math.min(...stopLats)) / 2;
    const routeLon = (Math.max(...stopLons) + Math.min(...stopLons)) / 2;
    // round to 6 decimal places
    const routeCenter = {
      route_lat: _.round(routeLat, 6),
      route_lon: _.round(routeLon, 6),
    };
    return { ...route, ...routeCenter };
  });
  await writeJson(`${dir}/routes.json`, newRoutes);
  console.log("asdf");
}

module.exports = {
  addCenters,
};
