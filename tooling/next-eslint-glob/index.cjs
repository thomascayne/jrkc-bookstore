const { isAbsolute } = require('node:path');
const { globSync: tinyGlobSync } = require('tinyglobby');

// Next's getRootDirs uses only this synchronous string-pattern API.
// Preserve absolute input paths, including Windows paths on another drive.
exports.globSync = function globSync(pattern, options = {}) {
  if (typeof pattern !== 'string') {
    throw new TypeError(
      'The Next.js lint glob adapter expects a string pattern',
    );
  }
  return tinyGlobSync(pattern, {
    ...options,
    absolute: isAbsolute(pattern) || options.absolute === true,
    expandDirectories: false,
  });
};
