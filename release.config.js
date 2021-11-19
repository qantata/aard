module.exports = {
  "plugins":
    [
      ["@semantic-release/commit-analyzer", {
        "preset": "angular",
        "parserOpts": {
          "noteKeywords": ["Major Release", "Major release", "major release"]
        }
      }],
      ["@semantic-release/release-notes-generator", {
        "preset": "angular",
        "parserOpts": {
          "noteKeywords": ["Major Release", "Major release", "major release"]
        }
      }],
      ["@semantic-release/github", {
        "assets": [
          {"path": `aard-linux-x64-${process.env.AARD_NEXT_VERSION}.tar.gz`}
        ]
      }]
    ]
}
