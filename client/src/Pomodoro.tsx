import React, { useState, useEffect } from "react";
import "./Pomodoro.css";
import { usePomodoroController } from "./hook/usePomodoroController"; // 引入 API Hook

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

  const { createPomodoroSession, updatePomodoroSession } = usePomodoroController(); 

  const currentColor =
    tagOptions.find((option) => option.label === selectedTag)?.color ||
    "#ff5722";

  const centerX = 150;
  const centerY = 150;
  const outerR = 150;
  const innerR = 140;

  // 红色小圆显示角度：当 accumulated = 0 时，redAngle = (0+270)%360 = 270，即顶部
  const redAngle = (accumulated + 270) % 360;
  const redX = centerX + outerR * Math.cos((redAngle * Math.PI) / 180);
  const redY = centerY + outerR * Math.sin((redAngle * Math.PI) / 180);

  // 映射累计角度到秒数（360度对应7200秒），然后转换为 mm:ss 格式
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

  // 倒计时：每秒减少 0.05 度（因为1度=20秒）
  useEffect(() => {
    if (isRunning) {
      const timer = setInterval(() => {
        setAccumulated((prev) => {
          if (prev <= 0.05) {
            clearInterval(timer);
            setIsRunning(false);

            if (pomodoroId !== null) {
              updatePomodoroSession(pomodoroId, true);
            }

            return 0;
          }
          return prev - 0.05;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isRunning]);

  const handleStartEnd = async () => {
    if (isRunning) {
      //
      if (pomodoroId !== null) {
        await updatePomodoroSession(pomodoroId, false);
      }
  
      // 重置状态
      setAccumulated(0);
      setIsRunning(false);
      setPomodoroId(null); // 
    } else {
     
      if (minutes > 0) {
        const session = await createPomodoroSession(selectedTag, minutes);
        if (session && session.id) {
          setPomodoroId(session.id); //
        }
        setIsRunning(true);
      } else {
        alert("At least 1 min.");
      }
    }
  };

  let thickPath = "";
  if (accumulated === 360) {
    thickPath = `
      M150,0
      A150,150 0 1,1 150,300
      A150,150 0 1,1 150,0
      Z
      M150,10
      A140,140 0 1,0 150,290
      A140,140 0 1,0 150,10
      Z
    `;
  } else if (accumulated > 0) {
    const outerEndX =
      centerX + outerR * Math.cos(((accumulated - 90) * Math.PI) / 180);
    const outerEndY =
      centerY + outerR * Math.sin(((accumulated - 90) * Math.PI) / 180);
    const innerEndX =
      centerX + innerR * Math.cos(((accumulated - 90) * Math.PI) / 180);
    const innerEndY =
      centerY + innerR * Math.sin(((accumulated - 90) * Math.PI) / 180);
    const outerStartX =
      centerX + outerR * Math.cos((-90 * Math.PI) / 180);
    const outerStartY =
      centerY + outerR * Math.sin((-90 * Math.PI) / 180);
    const innerStartX =
      centerX + innerR * Math.cos((-90 * Math.PI) / 180);
    const innerStartY =
      centerY + innerR * Math.sin((-90 * Math.PI) / 180);
    const largeArcFlag = accumulated > 180 ? 1 : 0;
    thickPath = `
      M ${outerStartX},${outerStartY}
      A ${outerR},${outerR} 0 ${largeArcFlag} 1 ${outerEndX},${outerEndY}
      L ${innerEndX},${innerEndY}
      A ${innerR},${innerR} 0 ${largeArcFlag} 0 ${innerStartX},${innerStartY}
      Z
    `;
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
            {isRunning ? "End" : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;

