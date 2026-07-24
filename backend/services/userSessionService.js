const normalizeSessionVersion = (value) => {
  const version = Number(value);
  return Number.isSafeInteger(version) && version >= 0 ? version : 0;
};

const sessionMatches = (tokenVersion, storedVersion) =>
  normalizeSessionVersion(tokenVersion) === normalizeSessionVersion(storedVersion);

module.exports = { normalizeSessionVersion, sessionMatches };
