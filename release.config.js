module.exports = {
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: [
          { type: "release-major", release: "major" },
          { type: "release-minor", release: "minor" },
          { type: "release-patch", release: "patch" },
        ],
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: [{ path: `aard-linux-x64-${process.env.AARD_NEXT_VERSION}.tar.gz` }],
      },
    ],
  ],
};
