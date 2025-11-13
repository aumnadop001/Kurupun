import { callGet, callPost } from "../call-api"

export const Login = async (credentials: { username: string; password: string; }) => {
  try {
    const response = await callPost("/api/auth/login/", credentials);
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}

export const register = async (data: { username: string; password: string; email: string; }) => {
  try {
    const response = await callPost("/api/auth/register/", data);
    return response;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
}

export const getProfile = async () => {
  try {
    const response = await callGet("/api/auth/profile/");
    return response;
  } catch (error) {
    console.error("Get profile failed:", error);
    throw error;
  }
}


