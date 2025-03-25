// 1. Extract from zip => Raw
// 2. Convert to JSON => Extracted
// 3. Process any files that need to be processed => Parsed
// 4. save the result in data/dist => Dist

// decent source: https://transitfeeds.com/
// just check the age

const extract = require("extract-zip");
const fs = require("fs");
const gtfsToJson = require("./gtfsToJson");
const simpleShapes = require("./simpleShapes");
const routesWithStops = require("./routesWithStops");
const routesWithShapeIds = require("./routesWithShapeIds");
const addCentersToRoutes = require("./addCentersToRoutes");
const tripIdsToRouteIds = require("./tripIdsToRouteIds");

async function unzipAll(rawPath, extractedPath, selectedFilenames) {
  const filenames = fs.readdirSync(rawPath);
  const dir = __dirname;
  for (const filename of filenames) {
    if (
      selectedFilenames &&
      !selectedFilenames.includes(filename.replace(".zip", ""))
    ) {
      continue;
    }
    console.log(`Unzipping ${filename}`);
    const zipPath = `${dir}/${rawPath}/${filename}`;
    const extractPath = `${dir}/${extractedPath}/${filename}`.replace(
      ".zip",
      ""
    );
    await extract(zipPath, { dir: extractPath });
  }
}

function copyToDist(parsedDir, distDir) {
  console.log(`Copying files to  ${distDir}`);
  assureDir(distDir);
  for (const file of distFiles) {
    fs.copyFileSync(`${parsedDir}/${file}`, `${distDir}/${file}`);
  }
}

async function deleteFolder(path) {
  fs.rmSync(path, { recursive: true });
}

function assureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

const RAW_BASE_PATH = "data/raw";
const EXTRACTED_BASE_PATH = "data/extracted";
const PARSED_BASE_PATH = "data/parsed";
const DIST_BASE_PATH = "data/dist";

const distFiles = [
  "routes.json",
  "shapes.json",
  "agency.json",
  "routesWithStops.json",
  "routesWithShapeIds.json",
  // "tripIdsToRouteIds.json",
];

async function main() {
  assureDir(EXTRACTED_BASE_PATH);
  assureDir(PARSED_BASE_PATH);
  assureDir(DIST_BASE_PATH);

  // const agencies = fs.readdirSync(EXTRACTED_BASE_PATH);
  const agencies = ["sfmta"]; // can specify agencies here
  await unzipAll(RAW_BASE_PATH, EXTRACTED_BASE_PATH, agencies);
  for (const agency of agencies) {
    console.log(`Converting files for ${agency}`);
    const extractedDir = `${EXTRACTED_BASE_PATH}/${agency}`;
    const parsedDir = `${PARSED_BASE_PATH}/${agency}`;
    const distDir = `${DIST_BASE_PATH}/${agency}`;
    assureDir(extractedDir);
    assureDir(parsedDir);
    assureDir(distDir);

    await gtfsToJson.convert(extractedDir, parsedDir);
    await simpleShapes.simplify(`${parsedDir}/shapes.json`); // sort the shapes.json file by shape_id and shape_pt_sequence
    await routesWithStops.addRoutesWithStops(parsedDir); // create new file that is easy to get route stops out of
    await routesWithShapeIds.addRoutesWithShapeIds(parsedDir); // create new file that is easy to get route shape ids out of
    await tripIdsToRouteIds.addTripIdsToRouteIds(parsedDir); // create new file that maps trips to routes
    await addCentersToRoutes.addCenters(parsedDir); // create new file that is easy to get route shape ids out of
    copyToDist(parsedDir, distDir); // copy dist files to dist folder
    deleteFolder(parsedDir); // cleanup extracted files

    console.log();
  }
}

main();
