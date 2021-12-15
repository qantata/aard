if [ -z "$1" ]; then
  echo "Usage: release.sh <app> [<files>...]"
  exit 0
fi

PKG="$1"
VERSION=$(node -p -e "require('./package.json').version")
TAG="$1-$VERSION"

# If the release already exist, we don't want to release
[[ $(gh release view $TAG 2>&1) == "release not found" ]] || exit 0

notes=""
is_copying_notes=false

CHANGELOG_PATH="./CHANGELOG.md"

if [ ! -f "$CHANGELOG_PATH" ]; then
  echo "CHANGELOG does not exist."
  exit 0
fi

# Copy release notes from CHANGELOG
while IFS= read -r line
do
  # This relies on consistent changesets formatting.
  # If we change to a more customized changelog format, this needs to change.
  if [[ $line == "## "* && $line != "### "* ]]; then
    if [ $is_copying_notes == true ]; then
      break
    fi

    is_copying_notes=false
  fi

  if [ "$line" == "## $VERSION" ]; then
    is_copying_notes=true
    continue
  fi

  if [ $is_copying_notes == true ]; then
    notes+="$line\n"
  fi
done < "./CHANGELOG.md"

# Remove the app name from args beacuse we want to pass the files directly to gh release
shift

# Release notes doesn't parse \n correctly so we have to use this workaround
echo -e "$notes" > notes.md

# Need to pass -p to pre-releases
if [[ $VERSION =~ "next" || $VERSION =~ "alpha" || $VERSION =~ "beta" || $VERSION =~ "rc" ]]; then
  gh release create "$TAG" -p -t "$TAG" --notes-file notes.md "$@"
else
  gh release create "$TAG" -t "$TAG" --notes-file notes.md "$@"
fi