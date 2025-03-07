import React, { useState, useEffect } from "react";
import "./Pomodoro.css";
import { usePomodoroController } from "./hook/usePomodoroController";

const API_BASE_URL = "https://localhost:7028/api/Pomodoro";

interface TagOption {
  label: string;
  color: string;
}

const tagOptions: TagOption[] = [
  { label: "Study", color: "#ff5722" },
  { label: "Work", color: "#2196F3" },
  { label: "Exercise", color: "#4CAF50" },
  { label: "Reading", color: "#9C27B0" },
  { label: "Creative", color: "#FF9800" },
  { label: "Meditation", color: "#00BCD4" },
];

const Pomodoro: React.FC = () => {
  const [accumulated, setAccumulated] = useState(0);
  const [prevLogical, setPrevLogical] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTag, setSelectedTag] = useState("Study");
  const [pomodoroId, setPomodoroId] = useState<number | null>(null);
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);

  useEffect(() => {
    const savedState = sessionStorage.getItem("pomodoroState");
    if (savedState) {
      const { 
        savedAccumulated, 
        savedIsRunning, 
        savedStartTime,
        savedSelectedTag,
        savedPomodoroId 
      } = JSON.parse(savedState);
      
      if (savedIsRunning) {
        const elapsed = (Date.now() - savedStartTime) / 1000;
        const newAccumulated = Math.max(savedAccumulated - elapsed * 0.05, 0);
        
        if (savedPomodoroId) {
          const actualDuration = Math.floor(elapsed);
          fetch(`${API_BASE_URL}/${savedPomodoroId}/update-on-unload`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              isCompleted: newAccumulated <= 0,
              ActualDuration: actualDuration
            }),
            keepalive: true
          }).catch(err => console.error("状态恢复更新失败:", err));
        }

        setAccumulated(newAccumulated);
        setIsRunning(newAccumulated > 0);
        setSelectedTag(savedSelectedTag);
        setPomodoroId(savedPomodoroId);
        setStartTimestamp(savedStartTime);
      }
    }
  }, []);

  useEffect(() => {
    if (isRunning || pomodoroId !== null) {
      const stateToSave = {
        savedAccumulated: accumulated,
        savedIsRunning: isRunning,
        savedStartTime: startTimestamp || Date.now(),
        savedSelectedTag: selectedTag,
        savedPomodoroId: pomodoroId
      };
      sessionStorage.setItem("pomodoroState", JSON.stringify(stateToSave));
    } else {
      sessionStorage.removeItem("pomodoroState");
    }
  }, [accumulated, isRunning, selectedTag, pomodoroId, startTimestamp]);

  const { createPomodoroSession, updatePomodoroSession } = usePomodoroController();

  const currentColor =
    tagOptions.find((option) => option.label === selectedTag)?.color ||
    "#ff5722";

  const centerX = 150;
  const centerY = 150;
  const outerR = 150;
  const innerR = 140;

  const redAngle = (accumulated + 270) % 360;
  const redX = centerX + outerR * Math.cos((redAngle * Math.PI) / 180);
  const redY = centerY + outerR * Math.sin((redAngle * Math.PI) / 180);

  const totalSeconds = Math.round((accumulated / 360) * 7200);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeDisplay =
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0");

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  const computeLogicalAngle = (
    clientX: number,
    clientY: number,
    rect: DOMRect
  ) => {
    const svgCenterX = rect.left + rect.width / 2;
    const svgCenterY = rect.top + rect.height / 2;
    const dx = clientX - svgCenterX;
    const dy = clientY - svgCenterY;
    const absAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return (((absAngle + 90) % 360) + 360) % 360;
  };

  const handleMouseDown = (e: React.MouseEvent<SVGCircleElement>) => {
    if (isRunning) return;
    setDragging(true);
    const svgElem = e.currentTarget.ownerSVGElement as SVGSVGElement;
    const rect = svgElem.getBoundingClientRect();
    const logical = computeLogicalAngle(e.clientX, e.clientY, rect);
    setPrevLogical(logical);
    e.stopPropagation();
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging || isRunning) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newLogical = computeLogicalAngle(e.clientX, e.clientY, rect);
    let delta = newLogical - prevLogical;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    if (delta > 0 && accumulated + delta > 360) {
      delta = 360 - accumulated;
    }
    if (delta < 0 && accumulated + delta < 0) {
      delta = -accumulated;
    }
    setAccumulated((prev) => clamp(prev + delta, 0, 360));
    setPrevLogical(newLogical);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (isRunning) {
      const startTime = Date.now();
      setStartTimestamp(startTime);
      
      const timer = setInterval(() => {
        const currentTime = Date.now();
        const elapsedSeconds = (currentTime - startTime) / 1000;
        const newAccumulated = Math.max(accumulated - elapsedSeconds * 0.05, 0);
        
        setAccumulated(newAccumulated);
        
        if (newAccumulated <= 0) {
          clearInterval(timer);
          setIsRunning(false);
          if (pomodoroId) {
            updatePomodoroSession(pomodoroId, true);
          }
          sessionStorage.removeItem("pomodoroState");
        }
      }, 1000);

      const handleUnload = async () => {
        if (pomodoroId && startTimestamp) {
          const actualDuration = Math.floor((Date.now() - startTimestamp) / 1000);
          const isCompleted = accumulated <= 0;
          const blob = new Blob([JSON.stringify({
            isCompleted,
            ActualDuration: actualDuration
          })], { type: "application/json" });
          navigator.sendBeacon(
            `${API_BASE_URL}/${pomodoroId}/update-on-unload`,
            blob
          );
        }
      };

      window.addEventListener("beforeunload", handleUnload);
      return () => {
        clearInterval(timer);
        window.removeEventListener("beforeunload", handleUnload);
      };
    }
  }, [isRunning, pomodoroId, accumulated, startTimestamp]);

  useEffect(() => {
    return () => {
      if (pomodoroId && startTimestamp) {
        const actualDuration = Math.floor((Date.now() - startTimestamp) / 1000);
        const isCompleted = accumulated <= 0;
        fetch(`${API_BASE_URL}/${pomodoroId}/update-on-unload`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCompleted, ActualDuration: actualDuration }),
          keepalive: true
        }).catch(err => console.error("组件卸载更新失败:", err));
      }
    };
  }, [pomodoroId, startTimestamp, accumulated]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && pomodoroId && startTimestamp) {
        const actualDuration = Math.floor((Date.now() - startTimestamp) / 1000);
        const isCompleted = accumulated <= 0;
        fetch(`${API_BASE_URL}/${pomodoroId}/update-on-unload`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCompleted, ActualDuration: actualDuration }),
          keepalive: true
        }).catch(err => console.error("Visibility update failed:", err));
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pomodoroId, startTimestamp, accumulated]);

  const handleStartEnd = async () => {
    if (isRunning) {
      sessionStorage.removeItem("pomodoroState"); 
      if (pomodoroId !== null) {
        await updatePomodoroSession(pomodoroId, false);
      }
      setAccumulated(0);
      setIsRunning(false);
      setPomodoroId(null);
      setStartTimestamp(null);
    } else {
      if (minutes > 0) {
        const session = await createPomodoroSession(selectedTag, minutes);
        if (session?.id) {
          setPomodoroId(session.id);
          const now = Date.now();
          setStartTimestamp(now);
          setIsRunning(true);
          
          sessionStorage.setItem("pomodoroState", JSON.stringify({
            savedAccumulated: accumulated,
            savedIsRunning: true,
            savedStartTime: now,
            savedSelectedTag: selectedTag,
            savedPomodoroId: session.id
          }));
        }
      } else {
        alert("至少需要1分钟");
      }
    }
  };

  let thickPath = "";
  if (accumulated === 360) {
    thickPath = 
      `M150,0
       A150,150 0 1,1 150,300
       A150,150 0 1,1 150,0
       Z
       M150,10
       A140,140 0 1,0 150,290
       A140,140 0 1,0 150,10
       Z`;
  } else if (accumulated > 0) {
    const outerEndX =
      centerX + outerR * Math.cos(((accumulated - 90) * Math.PI) / 180);
    const outerEndY =
      centerY + outerR * Math.sin(((accumulated - 90) * Math.PI) / 180);
    const innerEndX =
      centerX + innerR * Math.cos(((accumulated - 90) * Math.PI) / 180);
    const innerEndY =
      centerY + innerR * Math.sin(((accumulated - 90) * Math.PI) / 180);
    const outerStartX = centerX + outerR * Math.cos((-90 * Math.PI) / 180);
    const outerStartY = centerY + outerR * Math.sin((-90 * Math.PI) / 180);
    const innerStartX = centerX + innerR * Math.cos((-90 * Math.PI) / 180);
    const innerStartY = centerY + innerR * Math.sin((-90 * Math.PI) / 180);
    const largeArcFlag = accumulated > 180 ? 1 : 0;
    thickPath = 
      `M ${outerStartX},${outerStartY}
       A ${outerR},${outerR} 0 ${largeArcFlag} 1 ${outerEndX},${outerEndY}
       L ${innerEndX},${innerEndY}
       A ${innerR},${innerR} 0 ${largeArcFlag} 0 ${innerStartX},${innerStartY}
       Z`;
  }

  return (
    <div className="pomodoro-container">
      <div className="pomodoro-timer-wrapper">
        <div className="pomodoro-circle">
          <svg
            width="330"
            height="330"
            viewBox="-15 -15 330 330"
            preserveAspectRatio="xMidYMid meet"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <clipPath id="rightHalf">
                <rect x="150" y="-15" width="165" height="345" />
              </clipPath>
            </defs>
            <circle cx="150" cy="150" r="150" fill="none" stroke="#000" strokeWidth="2" />
            <circle cx="150" cy="150" r="140" fill="none" stroke="#000" strokeWidth="2" />
            {accumulated > 0 && <path d={thickPath} fill="#000" fillRule="evenodd" />}
            <circle
              cx={redX}
              cy={redY}
              r="10"
              fill={currentColor}
              onMouseDown={handleMouseDown}
              style={{ cursor: isRunning ? "default" : "pointer" }}
            />
            <text
              x="150"
              y="160"
              textAnchor="middle"
              fontSize="40"
              fontWeight="bold"
              fill="#000"
            >
              {timeDisplay}
            </text>
          </svg>
        </div>
        <div className="task-tag-container">
          <div className="task-tag">
            <span className="tag-dot" style={{ backgroundColor: currentColor }}></span>
            <select
              className="tag-select"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              disabled={isRunning}
            >
              {tagOptions.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button className="start-button" onClick={handleStartEnd}>
            {isRunning ? "停止" : "开始"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
