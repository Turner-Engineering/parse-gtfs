const fs = require("fs");
const { parseChunked } = require("@discoveryjs/json-ext");
const { stringifyStream } = require("@discoveryjs/json-ext");

async function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (e) {
    console.log(`Reading ${path}`);
    const readStream = fs.createReadStream(path);
    return await parseChunked(readStream);
  }
}

async function writeJson(path, data) {
  try {
    const dataString = JSON.stringify(data);
    fs.writeFileSync(path, dataString);
  } catch (err) {
    console.log(`Writing ${path}`);
    const writeStream = fs.createWriteStream(path);
    await new Promise((resolve, reject) => {
      stringifyStream(data)
        .on("error", reject)
        .pipe(writeStream)
        .on("error", reject)
        .on("finish", resolve);
    });
  }
}

function readTxt(path) {
  return fs.readFileSync(path, "utf8");
}

module.exports = {
  readJson,
  writeJson,
  readTxt,
};
