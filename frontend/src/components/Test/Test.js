import React, { useState, useEffect } from "react";
import Form from "./TestForm";

const Test = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch data from the backend
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5001/v1/api/data2");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Call the fetch function
    fetchData();
  }, []); // Empty dependency array ensures that the effect runs once, similar to componentDidMount

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2> Test Page with Backend Data </h2>{" "}
      {loading && <p> Loading data... </p>}{" "}
      {error && <p style={{ color: "red" }}> Error: {error} </p>}{" "}
      {data && (
        <div>
          <p> {JSON.stringify(data.message)} </p>{" "}
          {/* You can now use the 'data' state in your component as needed */}{" "}
        </div>
      )}{" "}
      <Form />
    </div>
  );
};

export default Test;
