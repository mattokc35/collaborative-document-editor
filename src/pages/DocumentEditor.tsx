import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  Alert,
} from "@mui/material";
import AuthContext from "../context/AuthContext";
import useWebSocket from "../hooks/useWebSocket";
import {
  getDocument,
  getSharedUsers,
  shareDocument,
  getUserByUsername,
} from "../network/networkRequests";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const DocumentEditor: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [shareUserName, setShareUserName] = useState<string>("");
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState<string>("");
  const [sharedUsers, setSharedUsers] = useState<string[]>([]);
  const authContext = useContext(AuthContext);
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { ws, status, error, sendMessage } = useWebSocket(
    "ws://localhost:5001"
  );

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const { authData, setAuthData } = authContext;

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        if (authData) {
          const { content, title } = await getDocument(documentId!, authData);
          setContent(content);
          setDocumentTitle(title);

          const users = await getSharedUsers(documentId!, authData);
          setSharedUsers(users.map((user: any) => user.username));
        }
      } catch (error) {
        console.error("Failed to fetch document", error);
      }
    };
    fetchDocument();
  }, [authData, documentId]);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const { type, data } = JSON.parse(event.data);
        if (
          type === "DOCUMENT_UPDATE" &&
          data.documentId === Number(documentId)
        ) {
          setContent(data.content);
        }
      };
    }
  }, [ws, documentId]);

  const handleChange = (newContent: string) => {
    setContent(newContent);
    sendMessage({
      type: "UPDATE_DOCUMENT",
      data: { documentId: Number(documentId), content: newContent },
    });
  };

  const handleShare = async () => {
    if (!shareUserName) {
      setShareError("User name is required");
      setShareSuccess(null);
      return;
    }
    try {
      if (authData) {
        const userResponse = await getUserByUsername(shareUserName, authData);
        const userId = userResponse.id;

        await shareDocument(documentId!, userId, authData);

        setShareUserName("");
        setShareError(null);
        setShareSuccess("Document shared successfully");

        setSharedUsers((prev) => [...prev, shareUserName]);
      }
    } catch (error) {
      console.error("Failed to share document", error);
      setShareError("Failed to share document");
      setShareSuccess(null);
    }
  };

  const handleLogout = () => {
    setAuthData(null);
    navigate("/login");
  };

  if (status === "ERROR") {
    return <Alert severity="error">Error: {error}</Alert>;
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 2 }}>
        {documentTitle}
      </Typography>
      <Box sx={{ mb: 2 }}>
        <ReactQuill
          value={content}
          onChange={handleChange}
          placeholder="Edit document..."
          theme="snow"
          style={{ height: "400px" }}
        />
      </Box>
      <Box sx={{ mb: 3, mt: 7 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TextField
            label="Share with user"
            value={shareUserName}
            onChange={(e) => setShareUserName(e.target.value)}
            variant="outlined"
            sx={{ flex: 1, mr: 2 }}
          />
          <Button variant="contained" onClick={handleShare}>
            Share Document
          </Button>
        </Box>
        {shareSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {shareSuccess}
          </Alert>
        )}
        {shareError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {shareError}
          </Alert>
        )}
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>
          Shared With:
        </Typography>
        <List>
          {sharedUsers.map((user, index) => (
            <ListItem key={index}>{user}</ListItem>
          ))}
        </List>
        <Button
          variant="contained"
          color="error"
          onClick={handleLogout}
          sx={{ mb: 2 }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default DocumentEditor;
