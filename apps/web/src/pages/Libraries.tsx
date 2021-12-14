import { Button, TextField, Typography } from "@mui/material";
import { graphql } from "react-relay";
import { useState } from "react";
import { PreloadedQuery, useMutation, usePreloadedQuery } from "react-relay";

import { LibrariesQuery } from "./__generated__/LibrariesQuery.graphql";
import { Libraries_createLibraryMutation } from "./__generated__/Libraries_createLibraryMutation.graphql";
import { Libraries_deleteLibraryMutation } from "./__generated__/Libraries_deleteLibraryMutation.graphql";

type Props = {
  prepared: {
    librariesQuery: PreloadedQuery<LibrariesQuery>;
  };
};

const Libraries: React.FunctionComponent<Props> = ({ prepared }) => {
  const [newLibraryRoot, setNewLibraryRoot] = useState("");
  const [error, setError] = useState("");
  const [newLibraries, setNewLibraries] = useState<any>([]);

  const data = usePreloadedQuery(
    graphql`
      query LibrariesQuery {
        libraries {
          id
          root
        }
      }
    `,
    prepared.librariesQuery
  );

  // TODO: Replace @deleteRecord because it keeps the record as null in the store
  const [commitDeleteLibrary] =
    useMutation<Libraries_deleteLibraryMutation>(graphql`
      mutation Libraries_deleteLibraryMutation($id: String!) {
        deleteLibrary(id: $id) {
          id @deleteRecord
        }
      }
    `);

  const [commitCreateLibrary] =
    useMutation<Libraries_createLibraryMutation>(graphql`
      mutation Libraries_createLibraryMutation($root: String!) {
        createLibrary(root: $root) {
          id
          root
        }
      }
    `);

  const onRemoveClick = (id: string) => {
    commitDeleteLibrary({
      variables: {
        id,
      },
      onCompleted: () => {
        // TODO: Replace
        const idx = newLibraries.findIndex((l: any) => l.id === id);
        if (idx !== -1) {
          setNewLibraries([
            ...newLibraries.slice(0, idx),
            ...newLibraries.slice(idx + 1, newLibraries.length),
          ]);
        }
      },
      onError: (err) => {
        console.error("err:", err);
      },
    });
  };

  const handleLibraryRootChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLibraryRoot(e.target.value);
  };

  const onButtonClick = () => {
    if (newLibraryRoot === "") {
      setError("The path is not a folder");
      return;
    }

    commitCreateLibrary({
      variables: {
        root: newLibraryRoot,
      },
      onCompleted: (res) => {
        if (!res.createLibrary) {
          setError("The library path is not valid (not a directory)");
        } else {
          // TODO: Use edges & connections instead of this hack
          setNewLibraries([...newLibraries, res.createLibrary]);
          setError("");
          setNewLibraryRoot("");
        }
      },
      onError: (err) => {
        console.error("err:", err);
        setError("An error occured.");
      },
    });
  };

  return (
    <>
      <Typography variant="h2">Libraries</Typography>
      {[...data.libraries, ...newLibraries].map((library) => {
        return (
          library !== null && (
            <div key={library.id}>
              <Typography variant="body1">{library.root}</Typography>
              <Typography
                variant="body2"
                sx={{ color: "red", marginBottom: 2, cursor: "pointer" }}
                onClick={() => onRemoveClick(library.id)}
              >
                Remove
              </Typography>
            </div>
          )
        );
      })}

      <TextField
        id="outlined-basic"
        label="Add library"
        variant="outlined"
        value={newLibraryRoot}
        onChange={handleLibraryRootChange}
        sx={{ marginTop: 2 }}
        error={error !== ""}
        helperText={error}
      />
      <br />
      <Button variant="contained" onClick={onButtonClick} sx={{ marginTop: 2 }}>
        Create library
      </Button>
    </>
  );
};

export default Libraries;
