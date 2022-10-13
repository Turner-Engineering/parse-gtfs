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

async function simplify(path) {
  console.log(`Simplifying Shapes: ${path}`);
  const shapesCollection = await readJson(path);
  await writeJson(
    path.replace("shapes.json", "RAW_shapes.json"),
    shapesCollection
  );
  const sortedShapes = sortShapesCollection(shapesCollection);
  const liteShapes = sortedShapes.map((shape) =>
    _.pick(shape, ["shape_id", "shape_pt_lat", "shape_pt_lon"])
  );
  await writeJson(path, liteShapes);
}

// sort("shapes.json");

module.exports = {
  simplify,
};
