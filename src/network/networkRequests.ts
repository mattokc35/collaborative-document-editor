import axios from "./axiosHelper";

const API_BASE_URL = "/api";

//generic request function
const request = async (
  method: "get" | "post" | "put" | "delete",
  url: string,
  data?: any,
  token?: string
) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios({
      method,
      url: `${API_BASE_URL}${url}`,
      data,
      headers,
    });
    return response.data;
  } catch (error) {
    console.error(`Request failed for ${url}`, error);
    throw error;
  }
};

//specific request functions
export const getDocuments = async (token: string) => {
  return request("get", "/documents", undefined, token);
};

export const createDocument = async (title: string, token: string) => {
  return request("post", "/documents", { title, content: "" }, token);
};

export const deleteDocument = async (id: number, token: string) => {
  return request("delete", `/documents/${id}`, undefined, token);
};

export const getDocument = async (id: string, token: string) => {
  return request("get", `/documents/${id}`, undefined, token);
};

export const getSharedUsers = async (id: string, token: string) => {
  return request("get", `/documents/${id}/shared-users`, undefined, token);
};

export const shareDocument = async (
  id: string,
  userId: string,
  token: string
) => {
  return request(
    "post",
    `/documents/${id}/share`,
    { userId, permission: "EDIT" },
    token
  );
};

export const getUserByUsername = async (username: string, token: string) => {
  return request("get", `/users?username=${username}`, undefined, token);
};

export const login = async (username: string, password: string) => {
  return request("post", "/auth/login", { username, password });
};

export const register = async (username: string, password: string) => {
  return request("post", "/auth/register", { username, password });
};
