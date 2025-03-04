import { useState } from "react";

const API_BASE_URL = "https://localhost:7028/api/Pomodoro"; // 请根据实际 API 地址修改

export const usePomodoroController = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 获取所有 PomodoroSessions
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

    // 获取单个 PomodoroSession
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

    // 创建一个新的 PomodoroSession
    const createPomodoroSession = async (taskTag: string, durationMinutes: number) => {
        try {
            setLoading(true);
            setError(null);
            
            // TimeSpan 在 JSON 中通常用 "hh:mm:ss" 格式表示
            const duration = `00:${durationMinutes}:00`; // 转换为 "hh:mm:ss" 格式
            
            const response = await fetch(`${API_BASE_URL}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskTag, duration })
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

    // 更新 PomodoroSession（完成状态、结束时间和奖励积分）
    const updatePomodoroSession = async (id: number, isCompleted: boolean) => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isCompleted })
            });

            if (!response.ok) throw new Error("Failed to update Pomodoro session");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
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
        updatePomodoroSession
    };
};
