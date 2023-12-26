import { makeStyles } from "@material-ui/core";
import Homepage from "./Pages/HomePage";
import "./App.css";
import { BrowserRouter, Route } from "react-router-dom";
import CoinPage from "./Pages/CoinPage";
import Header from "./components/Header";
import RegisterPage from "./Pages/RegisterPage";
// for testing
import Test from "./components/Test/Test";
import TestForm from "./components/Test/TestForm";

const useStyles = makeStyles(() => ({
  App: {
    backgroundColor: "#14161a",
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
        <Route path="/test" component={Test} />{" "}
        <Route path="/testForm" component={TestForm} />{" "}
      </div>{" "}
    </BrowserRouter>
  );
}

export default App;
