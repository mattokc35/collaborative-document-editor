import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  Alert,
} from "@mui/material";
import { login } from "../network/networkRequests";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    setSuccess(null);
    try {
      const response = await login(username, password);

      //store the token in local storage
      localStorage.setItem("token", response.token);

      //set success message and redirect
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000); //delay to show success message
    } catch (error) {
      console.error("Failed to log in", error);
      setError("Login failed. Please check your username and password.");
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>
        <Box component="form" sx={{ width: "100%", mt: 1 }}>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleLogin}
            sx={{ mt: 2 }}
          >
            Login
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Don't have an account?{" "}
          <Link to="/register"> Click here to register </Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login;
