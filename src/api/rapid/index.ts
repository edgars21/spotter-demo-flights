/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import axios from "axios";

interface ExtendedError extends Error {
  status?: number;
}

const clientApi = axios.create({
  baseURL: "https://sky-scrapper.p.rapidapi.com/api",
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    "x-rapidapi-host": "sky-scrapper.p.rapidapi.com",
    "x-rapidapi-key": import.meta.env.VITE_API_KEY,
  },
});

clientApi.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

clientApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (e) => {
    const status = e?.response?.data?.status || e?.response?.status;
    const message = e?.response?.data?.data?.message || e?.message || e?.code;

    const error = new Error(message) as ExtendedError;
    error.status = status;
    return Promise.reject(error);
  }
);

export const request = async (
  method: "GET" | "POST" | "PATCH" | "DELETE",
  url: string,
  options?: {
    params?: Object;
    data?: Object;
  }
) => {
  const response = await clientApi({
    method: method,
    url: url,
    params: options?.params,
    data: options?.data,
  });

  return response.data;
};

export const get = (url: string, params?: Object) => {
  return request("GET", url, { params: params });
};

export const post = (url: string, data: Object, params?: Object) => {
  return request("POST", url, {
    data: data,
    ...(params ? { params } : {}),
  });
};

export const patch = (url: string, data: Object, params?: Object) => {
  return request("PATCH", url, {
    data: data,
    ...(params ? { params } : {}),
  });
};

export const deletee = (url: string, params?: Object) => {
  return request("DELETE", url, { params: params });
};

export default {
  request,
  get,
  post,
  patch,
  delete: deletee,
};
