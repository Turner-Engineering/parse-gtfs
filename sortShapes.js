const _ = require("lodash");
const { readJson, writeJson } = require("./readWrite");

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
