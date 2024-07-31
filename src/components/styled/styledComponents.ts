import { styled } from "@mui/material/styles";
import ListItem from "@mui/material/ListItem";

export const StyledListItem = styled(ListItem)(({ theme }) => ({
  display: "inline-flex",
  margin: "2px",
  padding: "2px 8px",
  borderRadius: "16px",
  backgroundColor: theme.palette.grey[300],
  color: theme.palette.text.primary,
  fontSize: "14px",
  lineHeight: "20px",
  whiteSpace: "nowrap",
  textAlign: "center",
  alignItems: "center",
  width: "auto",
  minWidth: "0",
  boxSizing: "content-box",
}));
