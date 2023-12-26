import React, { useState, useEffect } from "react";
import {
  TextField,
  Container,
  Typography,
  Grid,
  makeStyles,
} from "@material-ui/core";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(5),
  },
  form: {},
  textField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  submitButton: {
    marginTop: theme.spacing(3),
  },
  errorText: {
    color: "red",
    marginTop: theme.spacing(2),
  },
}));

const Login = () => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (submitSuccess) {
      // Clear the form and error after successful submission
      setFormData({
        email: "",
        password: "",
      });
      setError("");
    }
  }, [submitSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      setError("Email is required");
      return;
    }

    if (!formData.password) {
      setError("Password is required");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("login success");
        window.alert("Login success");
        window.location.href = "/portfolio";
        setSubmitSuccess(true);
      } else {
        const responseData = await response.json();
        setError(responseData.error || "Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "An error occurred");
    }
  };

  return (
    <Container maxWidth="sm" className={classes.container}>
      <form onSubmit={handleSubmit} className={classes.form}>
        <Typography variant="h4" align="center" gutterBottom>
          LOGIN{" "}
        </Typography>{" "}
        {error && (
          <Typography variant="body2" className={classes.errorText}>
            {" "}
            {error}{" "}
          </Typography>
        )}{" "}
        <Grid container spacing={2} className={classes.form}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={classes.textField}
              InputProps={{
                style: { color: "#fff" },
              }}
              InputLabelProps={{
                style: { color: "#64b5f6" },
              }}
            />{" "}
          </Grid>{" "}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={classes.textField}
              InputProps={{
                style: { color: "#fff" },
              }}
              InputLabelProps={{
                style: { color: "#64b5f6" },
              }}
            />{" "}
          </Grid>{" "}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className={classes.submitButton}
              InputProps={{
                style: { color: "#fff" },
              }}
              InputLabelProps={{
                style: { color: "#64b5f6" },
              }}
            >
              Submit{" "}
            </Button>{" "}
          </Grid>{" "}
        </Grid>{" "}
      </form>{" "}
      <a
        href="/register"
        style={{
          float: "right",
          textDecoration: "underline",
          color: "#1976d2",
          paddingTop: "20px",
        }}
      >
        NOT REGISTER YET ?
      </a>{" "}
    </Container>
  );
};

export default Login;
