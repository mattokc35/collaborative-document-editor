import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import {
  Container,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Alert,
  Box,
} from "@mui/material";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import {
  getDocuments,
  createDocument,
  deleteDocument,
} from "../network/networkRequests";

const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [newDocumentTitle, setNewDocumentTitle] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { authData } = authContext;

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (authData) {
          const data = await getDocuments(authData);
          setDocuments(data);
        }
      } catch (error) {
        setErrorMessage("Failed to fetch documents");
        console.error("Failed to fetch documents", error);
      }
    };
    fetchDocuments();
  }, [authData]);

  const handleCreate = async () => {
    if (!newDocumentTitle) {
      setErrorMessage("Document title is required");
      setSuccessMessage(null);
      return;
    }
    try {
      if (authData) {
        const response = await createDocument(newDocumentTitle, authData);
        if (response && response.documentId) {
          setSuccessMessage("Document created successfully");
          setNewDocumentTitle("");
          setDocuments((prev) => [
            ...prev,
            { id: response.documentId, title: newDocumentTitle },
          ]);
          navigate(`/document/${response.documentId}`);
        } else {
          setErrorMessage("Unexpected response format");
          console.error("Unexpected response format", response);
        }
      }
    } catch (error) {
      setErrorMessage("Failed to create document");
      console.error("Failed to create document", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (authData) {
        await deleteDocument(id, authData);
        setDocuments((prevDocuments) =>
          prevDocuments.filter((doc) => doc.id !== id)
        );
        setSuccessMessage("Document deleted successfully");
      }
    } catch (error) {
      setErrorMessage("Failed to delete document");
      console.error("Failed to delete document", error);
    }
  };

  const handleEdit = (id: number) => {
    if (id) {
      navigate(`/document/${id}`);
    } else {
      setErrorMessage("Invalid document ID");
      console.error("Invalid document ID:", id);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            value={newDocumentTitle}
            onChange={(e) => setNewDocumentTitle(e.target.value)}
            placeholder="Enter document title"
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreate}
            sx={{ mt: 2 }}
          >
            Create Document
          </Button>
        </Box>
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <List>
          {documents.map((doc) => (
            <ListItem
              key={doc.id}
              secondaryAction={
                <>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleEdit(doc.id)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText primary={doc.title} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default Dashboard;
