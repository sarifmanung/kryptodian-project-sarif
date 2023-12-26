import {
  AppBar,
  Container,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@material-ui/core";
import {
  createTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useHistory } from "react-router-dom";
import { CryptoState } from "../CryptoContext";

const useStyles = makeStyles((theme) => ({
  title: {
    flex: 1,
    color: "gold",
    fontFamily: "Montserrat",
    fontWeight: "bold",
    cursor: "pointer",
  },
}));

const darkTheme = createTheme({
  palette: {
    primary: {
      main: "#fff",
    },
    type: "dark",
  },
});

function Header() {
  const classes = useStyles();
  const { currency, setCurrency } = CryptoState();

  const history = useHistory();

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar color="transparent" position="static">
        <Container>
          <Toolbar>
            <Typography
              onClick={() => history.push(`/`)}
              variant="h6"
              className={classes.title}
            >
              CRYPTODIAN{" "}
            </Typography>{" "}
            {/* <Button color="inherit">Login</Button> */}{" "}
            <Stack spacing={2} direction="row">
              <Button variant="outlined" onClick={() => history.push(`/login`)}>
                Login{" "}
              </Button>{" "}
            </Stack>{" "}
            <Select
              variant="outlined"
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={currency}
              style={{ width: 100, height: 40, marginLeft: 15, color: "#fff" }}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <MenuItem value={"USD"}> USD </MenuItem>{" "}
              <MenuItem value={"INR"}> INR </MenuItem>{" "}
              <MenuItem value={"THB"}> THB </MenuItem>{" "}
            </Select>{" "}
          </Toolbar>{" "}
        </Container>{" "}
      </AppBar>{" "}
    </ThemeProvider>
  );
}

export default Header;
