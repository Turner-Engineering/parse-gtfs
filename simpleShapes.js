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

function simplify(path) {
  console.log(`Simplifying Shapes: ${path}`);
  const shapesCollection = readJson(path);
  writeJson(
    path.replace("shapesLite.json", "RAW_shapes.json"),
    shapesCollection
  );
  const sortedShapes = sortShapesCollection(shapesCollection);
  const liteShapes = sortedShapes.map((shape) =>
    _.pick(shape, ["shape_id", "shape_pt_lat", "shape_pt_lon"])
  );
  writeJson(path, liteShapes);
}

// sort("shapes.json");

module.exports = {
  simplify,
};
