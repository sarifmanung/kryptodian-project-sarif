import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Grid,
  makeStyles,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(5),
  },
  form: {
    // display: "flex",
    // flexDirection: "column",
    // alignItems: "center",
  },
  textField: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  submitButton: {
    marginTop: theme.spacing(3),
  },
}));

const Form = () => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    Username: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (submitSuccess) {
      // Clear the form after successful submission
      setFormData({
        Username: "",
        email: "",
        phone: "",
        password: "",
        confirm_password: "",
      });
    }
  }, [submitSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that password and confirm_password are not empty
    if (!formData.password || !formData.confirm_password) {
      window.alert("Password and Confirm Password are required");
      return;
    }

    // Validate that password and confirm_password match
    if (formData.password !== formData.confirm_password) {
      window.alert("Password and Confirm Password must match");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/v1/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("Data submitted successfully");
        window.alert("Data submitted successfully");
        setSubmitSuccess(true);
      } else {
        console.error("Failed to submit data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Container maxWidth="sm" className={classes.container}>
      <form onSubmit={handleSubmit} className={classes.form}>
        <Typography variant="h4" align="center" gutterBottom>
          Register{" "}
        </Typography>{" "}
        <Grid container spacing={2} className={classes.form}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              variant="outlined"
              name="Username"
              value={formData.Username}
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
              label="Phone"
              variant="outlined"
              type="tel"
              name="phone"
              value={formData.phone}
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
            <TextField
              fullWidth
              label="Confirm Password"
              variant="outlined"
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
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
    </Container>
  );
};

export default Form;
