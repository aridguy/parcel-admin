import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NoPage = () => {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    // Countdown timer
    const countdown = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    // Redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => {
      clearInterval(countdown);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div 
      className="d-flex flex-column align-items-center justify-content-center vh-100 text-center"
      style={{
        backgroundColor: "#f8f9fa",
        padding: "20px"
      }}
    >
      <h1 
        className="display-1 fw-bold"
        style={{ color: "#0d6efd" }}
      >
        404
      </h1>

      <h3 className="mb-3 fw-semibold">
        Page Not Found
      </h3>

      <p className="text-muted mb-4" style={{ maxWidth: "350px" }}>
        The page you are looking for doesn't exist or has been moved.
      </p>

      <a href="/" className="btn btn-primary px-4 py-2 mb-3">
        Go Back Home
      </a>

      <p className="text-muted">
        Redirecting in <strong>{seconds}</strong> seconds...
      </p>
    </div>
  );
};

export default NoPage;
