import { useState } from "react";
import axios, { AxiosInstance } from "axios";
import { BACKEND_API_ENDPOINT } from "@env";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

const useAxios = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const axiosInstance: AxiosInstance = axios.create({
    baseURL: BACKEND_API_ENDPOINT,
  });

  const formatErrors = (errors: string[]): string => {
    return errors.map((err, index) => `${index + 1}. ${err}`).join("\n");
  };

  const addAuthHeaders = async () => {
    const token = await SecureStore.getItemAsync("jwt");
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common["Authorization"];
    }
  };

  const handleJwtError = async (error: any) => {
    if (error.response?.status == 401 && error.response?.data.message.includes("token")) {
      await SecureStore.deleteItemAsync("jwt");
      router.push("/login");
    }
  };

  const get = async <T extends unknown>(url: string, params?: object): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      await addAuthHeaders();
      const response = await axiosInstance.get<T>(url, { params });
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.errors
          ? `${err.response.data.message}\n\n` + formatErrors(err.response.data.errors)
          : err.response?.data?.message || err.message;

      setError(errorMessage);
      await handleJwtError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const post = async <T extends unknown>(url: string, data: object): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      await addAuthHeaders();
      const response = await axiosInstance.post<T>(url, data);
      return response.data;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.errors
          ? `${err.response.data.message}\n\n` + formatErrors(err.response.data.errors)
          : err.response?.data?.message || err.message;

      setError(errorMessage);
      await handleJwtError(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { get, post, loading, error };
};

export default useAxios;
