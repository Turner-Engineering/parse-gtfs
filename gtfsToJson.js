const fs = require("fs");
const { readTxt, writeJson } = require("./readWrite.js");

const GTFS_SPEC_FILENAMES = [
  // fetched on 2022-10-13 from https://developers.google.com/transit/gtfs/reference#table_of_contents
  "agency.txt",
  "stops.txt",
  "routes.txt",
  "trips.txt",
  "stop_times.txt",
  "calendar.txt",
  "calendar_dates.txt",
  "feed_info.txt",
  "fare_attributes.txt",
  "fare_rules.txt",
  "shapes.txt",
  "frequencies.txt",
  "transfers.txt",
  "pathways.txt",
  "levels.txt",
  "translations.txt",
  "attributions.txt",
];

function removeCharsFromString(string, chars) {
  if (!string) return "";
  for (const char of chars) {
    string = string.replaceAll(char, "");
  }
  return string;
}

function getLines(filename) {
  const charsToRemove = ["\r"];
  let dataString = readTxt(filename);
  dataString = removeCharsFromString(dataString, charsToRemove);
  const lines = dataString.split("\n");
  return lines;
}

async function getCollection(path) {
  // a collection is an array of objects
  const lines = getLines(path);
  const firstLine = lines.shift();
  const headers = firstLine.split(",");
  // remove all whitespace from before and after headers
  // not having this caused a bug once
  headers.forEach((header, index) => (headers[index] = header.trim()));

  const collection = lines.map((line) => {
    const row = {};
    // split values by commas, but ignore commas in quotes
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

    values.forEach((value, index) => {
      const key = headers[index].replaceAll('"',"");
      row[key] = value.replaceAll('"', "");
    });
    return row;
  });
  return collection;
}

// files to convert is all txt files in the source dir that are in the gtfs spec
function getFilenamesToConvert(dir, specFilenames) {
  // check that dir exists
  if (!fs.existsSync(dir)) {
    console.error(`Directory ${dir} does not exist`);
    throw new Error("Directory does not exist");
  }

  const filenames = fs.readdirSync(dir);
  const txtFilenames = filenames.filter((fname) => fname.endsWith(".txt"));
  const filesToConvert = txtFilenames.filter((fname) =>
    specFilenames.includes(fname)
  );
  return filesToConvert.map((filename) => `${dir}/${filename}`);
}

async function convertFile(path, sourceDir, targetDir) {
  const filename = path.split("/").pop();
  console.log(`Converting ${filename}`);
  try {
    const collection = await getCollection(path);
    if (collection.length > 0) {
      await writeJson(
        path.replace(".txt", ".json").replace(sourceDir, targetDir),
        collection
      );
    }
  } catch (err) {
    console.log(err);
  }
}

//TODO: maybe also sort the shapes file by point sequence

async function convert(sourceDir, targetDir) {
  console.log("Converting files in " + sourceDir);
  const filenamesToConvert = getFilenamesToConvert(
    sourceDir,
    GTFS_SPEC_FILENAMES
  );
  // if target dir doesn't exist, create it
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }
  for (const filename of filenamesToConvert) {
    await convertFile(filename, sourceDir, targetDir);
  }
}

function main() {
  const agencyFolderName = "mbtaGtfs";
  const sourceDir = `data/extracted/${agencyFolderName}`;
  const targetDir = `data/parsed/${agencyFolderName}`;
  convert(sourceDir, targetDir);
}

// export as node module

module.exports = {
  convert,
};
