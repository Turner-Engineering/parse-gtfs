const fs = require("fs");
const _ = require("lodash");

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

function writeJson(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function tryInt(str) {
  const int = parseInt(str);
  return isNaN(int) ? str : int;
}

function sortShapesCollection(shapesCollection) {
  return _.orderBy(shapesCollection, [
    (item) => tryInt(item.shape_id),
    (item) => tryInt(item.shape_pt_sequence),
  ]);
}

function sort(path) {
  console.log(`Sorting ${path}`);
  const shapesCollection = readJson(path);
  writeJson(
    path.replace("shapes.json", "UNSORTED_shapes.json"),
    shapesCollection
  );
  const sortedShapes = sortShapesCollection(shapesCollection);
  writeJson(path, sortedShapes);
}

// sort("shapes.json");

module.exports = {
  sort,
};
