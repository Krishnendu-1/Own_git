const fs = require("fs");
const path = require("path");
const zlib=require("zlib");

// You can use print statements as follows for debugging, they'll be visible when running tests.
// console.log("Logs from your program will appear here!");

//1st stage
const command = process.argv[2];

switch (command) {
  case "init":
    createGitDirectory();
    break;
  case "cat-file":
    const hash=process.argv[process.argv.length-1];
    if (!hash) {
        throw new Error('Hash is required as an argument for cat-file command');
    }
    catFile(hash);
    break;
    case "hash-object":
    hashGitObject(process.argv[process.argv.length-1]);
    break;
  default:
    throw new Error(`Command is not recognized ${command}`);
}


function createGitDirectory() {
  fs.mkdirSync(path.join(process.cwd(), ".git"), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), ".git", "objects"), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), ".git", "refs"), { recursive: true });

  fs.writeFileSync(path.join(process.cwd(), ".git", "HEAD"), "ref: refs/heads/main\n");
  console.log("Initialized git directory");
}

//*only "cat-file" "blob" reading not creating "blob" objects.
async function catFile(hash) {
    const filePath = await path.join(process.cwd(), ".git", "objects", hash.slice(0, 2), hash.slice(2));
    try{
    const content = fs.readFileSync(filePath);
    const decompressed = zlib.unzipSync(content);
    const res=decompressed.toString().split('\0')[1];    
    process.stdout.write(res);
}catch{
    throw new Error('errror!!!!!!');
}
    
    //git cat-file -p e88f7a929cd70b0274c4ea33b209c97fa845fdbc -->hello world # This is the contents of the blob

    // The added code defines an asynchronous function catFile that takes a hash parameter. This function reads the blob object from the .git/objects directory using the hash to construct the file path. The first two characters of the hash are used to find the subdirectory, and the rest of the hash is the filename.

    // The fs.readFileSync method is used to read the file's contents synchronously. The contents are expected to be compressed, so zlib.inflateSync is used to decompress them.
    
    // After decompression, the data is converted to a string and split at the null byte (\0). The first part of the split is the header, and the second part, which is accessed with [1], is the actual content of the blob.
    
    // Finally, process.stdout.write is used to print the content to the standard output without adding a newline character at the end, which mimics the behavior of the git cat-file command.
    
}


function hashGitObject(file) {
    const { size } = fs.statSync(file);
    const data = fs.readFileSync(file);
    const content = `blob ${size}\0${data.toString()}`;
    const blobSha = crypto.createHash("sha1").update(content).digest("hex");
    const objDir = blobSha.substring(0, 2);
    const objFile = blobSha.substring(2);
    fs.mkdirSync(path.join(process.cwd(), ".git", "objects", objDir), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(process.cwd(), ".git", "objects", objDir, objFile),
      zlib.deflateSync(content),
    );
    process.stdout.write(`${blobSha}\n`);
  }