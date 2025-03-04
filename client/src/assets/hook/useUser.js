import { useState } from "react";
import axios from "axios";

const API_BASE_URL = "https://localhost:7028/api/user";

export async function getBalance(userId) {
  const response = await axios.get(`${API_BASE_URL}/balance/${userId}`);
  return response.data;
}

export async function getUserName(userId) {
  const response = await axios.get(`${API_BASE_URL}/name/${userId}`);
  return response.data;
}

export async function updateUserName(userId, newName) {
  const response = await axios.put(
    `${API_BASE_URL}/name/${userId}`,
    JSON.stringify(newName),
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
}

export async function increaseBalance(userId, amount) {
  const response = await axios.put(
    `${API_BASE_URL}/balance/increase/${userId}`,
    JSON.stringify(amount),
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
}

export async function decreaseBalance(userId, amount) {
  const response = await axios.put(
    `${API_BASE_URL}/balance/decrease/${userId}`,
    JSON.stringify(amount),
    { headers: { "Content-Type": "application/json" } }
  );
  return response.data;
}

export function useUser() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = async (userId) => {
    setLoading(true);
    try {
      const data = await getBalance(userId);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  const fetchUserName = async (userId) => {
    setLoading(true);
    try {
      const data = await getUserName(userId);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  const changeName = async (userId, newName) => {
    setLoading(true);
    try {
      const data = await updateUserName(userId, newName);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  const addBalance = async (userId, amount) => {
    setLoading(true);
    try {
      const data = await increaseBalance(userId, amount);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  const subtractBalance = async (userId, amount) => {
    setLoading(true);
    try {
      const data = await decreaseBalance(userId, amount);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return {
    fetchBalance,
    fetchUserName,
    changeName,
    addBalance,
    subtractBalance,
    loading,
    error,
  };
}
