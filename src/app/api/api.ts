import axios from "axios";

export const experimentApi = axios.create({
    baseURL: '/experiments',
    withCredentials: true,
  });

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});
  