const fs = require('fs');
const path = require('path');
const inputPath = process.argv[2];
const outputPath = process.argv[3];
const delFiles = process.argv[4];

let counter = 0;
let transported = 0;
function createDirectory (path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function cpFile (file, filePath) {
  const dest = path.join(outputPath, file[0]);
  createDirectory(dest);
  fs.copyFile(filePath, path.join(dest, file), err => {
    if (err) throw err;
    console.log(`${file} transported to ${dest}`);
    transported++;
    if (typeof delFiles !== 'undefined') {
      if (transported === counter) {
        fs.unlink(filePath, err => {
          if (err) throw err;
          deleteDirs(inputPath);
        });
      } else {
        fs.unlink(filePath, err => {
          if (err) throw err;
        });
      }
    }
  });
}
function deleteDirs (basePath) {
  let files = fs.readdirSync(basePath);
  for (let file of files) {
    let localPath = path.join(basePath, file);
    let state = fs.statSync(localPath);

    if (state.isDirectory()) {
      deleteDirs(localPath);
    }
  }
  fs.rmdirSync(basePath);
}
function readDirectory (basePath) {
  fs.readdir(basePath, (err, files) => {
    if (err) throw err;
    counter += files.length;
    for (let file of files) {
      let localPath = path.join(basePath, file);
      let state = fs.statSync(localPath);

      if (state.isDirectory()) {
        readDirectory(localPath);
        counter--;
      } else {
        cpFile(file, localPath);
      }
    }
  });
}

if (typeof inputPath === 'undefined' || typeof outputPath === 'undefined') {
  console.log('Enter input data: inputPath and outputPath');
} else {
  createDirectory(outputPath);
  readDirectory(inputPath);
}
