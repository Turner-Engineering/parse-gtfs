// 1. Extract from zip
// 2. Convert to JSON
// 3. Process any files that need to be processed
// 4. save the result in data/parsed

const extract = require("extract-zip");
const fs = require("fs");
const gtfsToJson = require("./gtfsToJson");
const sortShapes = require("./sortShapes");
const routesWithStops = require("./routesWithStops");
const routesWithShapeIds = require("./routesWithShapeIds");

async function unzipAll(rawPath, extractedPath) {
  const filenames = fs.readdirSync(rawPath);
  const dir = __dirname;
  for (const filename of filenames) {
    console.log(`Unzipping ${filename}`);
    const zipPath = `${dir}/${rawPath}/${filename}`;
    const extractPath = `${dir}/${extractedPath}/${filename}`.replace(
      ".zip",
      ""
    );
    await extract(zipPath, { dir: extractPath });
  }
}

const RAW_PATH = "data/raw";
const EXTRACTED_PATH = "data/extracted";
const PARSED_PATH = "data/parsed";

const distFiles = [
  "routes.json",
  "shapes.json",
  "agency.json",
  "routesWithStops.json",
  "routesWithShapeIds.json",
];

async function main() {
  await unzipAll(RAW_PATH, EXTRACTED_PATH);
  const agencies = fs.readdirSync(EXTRACTED_PATH);
  for (const agency of agencies) {
    const sourceDir = `${EXTRACTED_PATH}/${agency}`;
    const targetDir = `${PARSED_PATH}/${agency}`;
    // await gtfsToJson.convert(sourceDir, targetDir);
    sortShapes.sort(`${targetDir}/shapes.json`); // sort the shapes.json file by shape_id and shape_pt_sequence
    routesWithStops.addRoutesWithStops(targetDir); // create new file that is easy to get route stops out of
    routesWithShapeIds.addRoutesWithShapeIds(targetDir); // create new file that is easy to get route shape ids out of
  }
  // rename all folders in extracted
}

main();
