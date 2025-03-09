import { useState } from "react";

const API_BASE_URL = "https://localhost:7028/api/Pomodoro";

export interface PomodoroSession {
  id: number;
  taskTag: string;
  startTime: string;
  endTime: string;
  duration: string;
  isCompleted: boolean;
  rewardPoints: number;
}

export interface PomodoroSessionCreateRequest {
  taskTag: string;
  duration: string; // "hh:mm:ss" 格式
}

export interface UpdatePomodoroSessionRequest {
  isCompleted: boolean;
  ActualDuration?: number;
}

export const usePomodoroController = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPomodoroSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}`);
      if (!response.ok) throw new Error("Failed to fetch Pomodoro sessions");
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPomodoroSession = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/${id}`);
      if (!response.ok) throw new Error("Pomodoro session not found");
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createPomodoroSession = async (
    taskTag: string,
    durationMinutes: number
  ) => {
    try {
      setLoading(true);
      setError(null);
      // 转换为 "hh:mm:ss" 格式（假设不超过 60 分钟）
      const duration = `00:${durationMinutes < 10 ? "0" : ""}${durationMinutes}:00`;
      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskTag, duration }),
      });
      if (!response.ok) throw new Error("Failed to create Pomodoro session");
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePomodoroSession = async (
    id: number,
    isCompleted: boolean
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
      });
      if (!response.ok) throw new Error("Failed to update Pomodoro session");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getTotalSessionCount = async (): Promise<number | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/total-count`);
      if (!response.ok) throw new Error("Failed to get total session count");
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getTotalFocusMinutes = async (): Promise<number | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/total-focus`);
      if (!response.ok) throw new Error("Failed to get total focus minutes");
      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = async (): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/completion-rate`);
      if (!response.ok) throw new Error("Failed to get completion rate");
      return await response.text();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getPomodoroSessions,
    getPomodoroSession,
    createPomodoroSession,
    updatePomodoroSession,
    getTotalSessionCount,
    getTotalFocusMinutes,
    getCompletionRate,
  };
};
