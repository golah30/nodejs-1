const fs = require('fs');
const path = require('path');
const inputPath = process.argv[2];
const outputPath = process.argv[3];
const delFiles = process.argv[4];

let FILES = [];
let deleted = 0;

function createDirectory (path) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path)) {
      fs.mkdir(path, err => {
        if (err && err.code !== 'EEXIST') throw err;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

function cpFile (file) {
  return new Promise((resolve, reject) => {
    const dest = path.join(outputPath, file.name[0], file.name);
    fs.copyFile(file.src, dest, err => {
      if (err) throw err;
      console.log(`${file.name} transported to ${dest}`);
      resolve();
    });
  });
}
function deletefile (src) {
  return new Promise((resolve, reject) => {
    fs.unlink(src, err => {
      if (err) throw err;
      deleted++;
      resolve();
    });
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
  const files = fs.readdirSync(basePath);

  for (let file of files) {
    let localPath = path.join(basePath, file);
    let state = fs.statSync(localPath);

    if (state.isDirectory()) {
      readDirectory(localPath);
    } else {
      FILES.push({ name: file, src: localPath });
    }
  }
}

function processFiles () {
  for (let file of FILES) {
    processFile(file);
  }
}

function processFile (file) {
  createDirectory(path.join(outputPath, file.name[0]))
    .then(() => {
      return cpFile(file);
    })
    .then(() => {
      if (typeof delFiles !== 'undefined') {
        return deletefile(file.src);
      }
    })
    .then(() => {
      if (typeof delFiles !== 'undefined' && deleted === FILES.length) {
        return deleteDirs(inputPath);
      } else {
        console.log(deleted + ' files deleted. Total: ' + FILES.length);
      }
    })
    .catch(e => {
      console.log(e);
    });
}
if (typeof inputPath === 'undefined' || typeof outputPath === 'undefined') {
  console.log('Enter input data: inputPath and outputPath');
} else {
  createDirectory(outputPath)
    .then(() => {
      readDirectory(inputPath);
      processFiles();
    })
    .catch(e => {
      console.log(e);
    });
}
