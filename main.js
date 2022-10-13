// 1. Extract from zip => Raw
// 2. Convert to JSON => Extracted
// 3. Process any files that need to be processed => Parsed
// 4. save the result in data/dist => Dist

const extract = require("extract-zip");
const fs = require("fs");
const gtfsToJson = require("./gtfsToJson");
const simpleShapes = require("./simpleShapes");
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

function copyToDist(parsedDir, distDir) {
  console.log(`Copying files to  ${distDir}`);
  assureDir(distDir);
  for (const file of distFiles) {
    fs.copyFileSync(`${parsedDir}/${file}`, `${distDir}/${file}`);
  }
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
];

async function main() {
  assureDir(EXTRACTED_BASE_PATH);
  assureDir(PARSED_BASE_PATH);
  assureDir(DIST_BASE_PATH);

  await unzipAll(RAW_BASE_PATH, EXTRACTED_BASE_PATH);
  const agencies = fs.readdirSync(EXTRACTED_BASE_PATH);
  for (const agency of agencies) {
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
    copyToDist(parsedDir, distDir); // copy dist files to dist folder
  }
}

main();
