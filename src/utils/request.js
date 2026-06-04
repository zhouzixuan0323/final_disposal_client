import axios from "axios";

export const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";


// 发送携带token的请求
const instanceWithToken = axios.create({ baseURL, timeout: 10000 });
// 发送普通请求 不携带token
const instanceWithoutToken = axios.create({ baseURL, timeout: 10000 });

// 请求拦截器
instanceWithToken.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 响应拦截器
instanceWithToken.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

// 响应拦截器
instanceWithoutToken.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

// 用于生成请求配置的函数
function generateRequestConfig(url, method, data) {
  return {
    url: url,
    method: method,
    [method === "get" ? "params" : "data"]: data,
  };
}

// 用于发送携带token的请求
export function requestWithToken(url, method, data) {
  return instanceWithToken(generateRequestConfig(url, method, data));
}
// 用于发送普通请求
export function requestWithoutToken(url, method, data) {
  return instanceWithoutToken(generateRequestConfig(url, method, data));
}
