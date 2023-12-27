import { makeStyles } from "@material-ui/core";
import Homepage from "./Pages/HomePage";
import "./App.css";
import { BrowserRouter, Route } from "react-router-dom";
import CoinPage from "./Pages/CoinPage";
import Header from "./components/Header";
import RegisterPage from "./Pages/RegisterPage";
import LoginPage from "./Pages/LoginPage";
import Portfolio from "./components/User/Portfolio";

const useStyles = makeStyles(() => ({
  App: {
    backgroundColor: "#1e2124!important",
    color: "white",
    minHeight: "100vh",
  },
}));

function App() {
  const classes = useStyles();

  return (
    <BrowserRouter>
      <div className={classes.App}>
        <Header />
        <Route path="/" component={Homepage} exact />
        <Route path="/coins/:id" component={CoinPage} exact />
        <Route path="/register" component={RegisterPage} exact />
        <Route path="/login" component={LoginPage} exact />
        <Route path="/portfolio" component={Portfolio} exact />
      </div>{" "}
    </BrowserRouter>
  );
}

export default App;
