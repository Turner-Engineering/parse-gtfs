const fs = require("fs");
const { parseChunked } = require("@discoveryjs/json-ext");
const { stringifyStream } = require("@discoveryjs/json-ext");

async function readJson(path) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch (e) {
    const readStream = fs.createReadStream(path);
    return await parseChunked(readStream);
  }
}

async function writeJson(path, data) {
  try {
    const dataString = JSON.stringify(data);
    fs.writeFileSync(path, dataString);
  } catch (err) {
    const writeStream = fs.createWriteStream(path);
    await stringifyStream(data, writeStream);
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
