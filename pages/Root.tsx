import { AppBar, Container, Toolbar, Typography } from "@mui/material";
import { useEffect } from "react";

import { useHistory } from "../src/routing/useHistory";
import Link from "../src/routing/Link";

const Root: React.FunctionComponent = ({ children }) => {
  const history = useHistory();

  useEffect(() => {
    history.push("/movies");
  }, []);

  return (
    <div>
      <AppBar position="sticky">
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit" component="div">
            <Link to="/">Aard</Link>
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ paddingTop: 4, paddingBottom: 4 }}>{children}</Container>
    </div>
  );
};

export default Root;
