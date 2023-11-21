# Parse GTFS

## Set up

1. make a top level folder data
2. make 4 sub folders dist, extracted, parsed, raw
3. make sure terminal is in parse-gtfs folder
4. run `npm install` which reads `package.json` and installs everything you need in a new folder `node_modules`

## Usage (adding a new GTFS static folder)

1. download the GTFS zip
2. copy into `data/raw`
3. rename with a short lowercase name that becomes the gtfs id
4. open `main.js`
5. Find the line `const agencies = [...]` and add the id that you just created (you can replace whatever is in the list already. can also run multiple at once). And save
6. then run with `node .\main.js` (and cross your fingers)
7. confirm that the zip folder was copied into the `extracted` and `dist` folders
8. copy dist output to cityscale-frontend
