// src/components/Form.js
import React, { useState } from "react";

import {
  TextField,
  Button,
  Container,
  Typography,
  Grid,
} from "@material-ui/core";

const Form = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      } else {
        console.error("Failed to submit data");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <form onSubmit={handleSubmit} style={{ marginTop: "10%" }}>
        <Typography variant="h4" align="center" gutterBottom>
          Contact Form{" "}
        </Typography>{" "}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              variant="outlined"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              InputProps={{
                style: { color: "#fff" }, // Text color
              }}
              InputLabelProps={{
                style: { color: "#64b5f6" }, // Label color
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
              InputProps={{
                style: { color: "#fff" }, // Text color
              }}
              InputLabelProps={{
                style: { color: "#64b5f6" }, // Label color
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
              InputProps={{
                style: { color: "#fff" }, // Text color
              }}
              InputLabelProps={{
                style: { color: "#64b5f6" }, // Label color
              }}
            />{" "}
          </Grid>{" "}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Submit{" "}
            </Button>{" "}
          </Grid>{" "}
        </Grid>{" "}
      </form>{" "}
    </Container>
  );
};

export default Form;
