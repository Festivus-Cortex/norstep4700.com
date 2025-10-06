const fs = require("fs");
const path = require("path");

/**
 * Copy a file from source to destination
 * @param {string} sourcePath - Path to the source file
 * @param {string} destPath - Path to the destination file
 * @returns {Promise<void>}
 */
async function copyFile(sourcePath, destPath) {
  try {
    // Normalize paths to be platform-agnostic
    const normalizedSource = path.normalize(sourcePath);
    const normalizedDest = path.normalize(destPath);

    // Check if source file exists
    if (!fs.existsSync(normalizedSource)) {
      throw new Error(`Source file does not exist: ${normalizedSource}`);
    }

    // Create destination directory if it doesn't exist
    const destDir = path.dirname(normalizedDest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Copy the file
    fs.copyFileSync(normalizedSource, normalizedDest);
    console.log(
      `File copied successfully from ${normalizedSource} to ${normalizedDest}`
    );
  } catch (error) {
    console.error("Error copying file:", error.message);
    throw error;
  }
}

/**
 * Copy a file using streams (for large files)
 * @param {string} sourcePath - Path to the source file
 * @param {string} destPath - Path to the destination file
 * @returns {Promise<void>}
 */
async function copyFileStream(sourcePath, destPath) {
  return new Promise((resolve, reject) => {
    try {
      const normalizedSource = path.normalize(sourcePath);
      const normalizedDest = path.normalize(destPath);

      // Check if source file exists
      if (!fs.existsSync(normalizedSource)) {
        throw new Error(`Source file does not exist: ${normalizedSource}`);
      }

      // Create destination directory if it doesn't exist
      const destDir = path.dirname(normalizedDest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Create read and write streams
      const readStream = fs.createReadStream(normalizedSource);
      const writeStream = fs.createWriteStream(normalizedDest);

      // Handle stream events
      readStream.on("error", reject);
      writeStream.on("error", reject);
      writeStream.on("finish", () => {
        console.log(
          `File copied successfully from ${normalizedSource} to ${normalizedDest}`
        );
        resolve();
      });

      // Pipe the data
      readStream.pipe(writeStream);
    } catch (error) {
      reject(error);
    }
  });
}

// Example usage
if (require.main === module) {
  // Get command line arguments
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log("Usage: node copyFile.js <source> <destination>");
    console.log("Example: node copyFile.js ./source.txt ./dest/source.txt");
    process.exit(1);
  }

  const [source, destination] = args;

  // Use the synchronous version for command line usage
  copyFile(source, destination)
    .then(() => {
      console.log("Copy operation completed successfully");
    })
    .catch((error) => {
      console.error("Copy operation failed:", error.message);
      process.exit(1);
    });
}

module.exports = { copyFile, copyFileStream };
