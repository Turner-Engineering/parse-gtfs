const { readJson, writeJson } = require("./readWrite");

async function getTripIdsToRouteIds(dir) {
  const tripIdsToRouteIds = {};
  const trips = await readJson(`${dir}/trips.json`);

  trips.forEach((trip) => {
    tripIdsToRouteIds[trip.trip_id] = trip.route_id;
  });

  return tripIdsToRouteIds;
}

async function addTripIdsToRouteIds(dir) {
  console.log(`Adding tripIdsToRouteIds to ${dir}`);
  const tripIdsToRouteIds = await getTripIdsToRouteIds(dir);
  await writeJson(`${dir}/tripIdsToRouteIds.json`, tripIdsToRouteIds);
}

module.exports = {
  addTripIdsToRouteIds,
};
