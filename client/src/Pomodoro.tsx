import React, { useState } from 'react';
import './Pomodoro.css';

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
  // 累计顺时针旋转的逻辑角度，范围0～360，默认0对应顶部，显示"00:00"
  const [accumulated, setAccumulated] = useState(0);
  // 记录拖拽时上一次的逻辑角度，初始0（顶部）
  const [prevLogical, setPrevLogical] = useState(0);
  const [dragging, setDragging] = useState(false);

  // 标签下拉选择框状态，默认"Study"
  const [selectedTag, setSelectedTag] = useState("Study");
  // 根据选中的标签查找对应颜色；若未匹配则默认"#ff5722"
  const currentColor =
    tagOptions.find(option => option.label === selectedTag)?.color || "#ff5722";

  const centerX = 150;
  const centerY = 150;
  const outerR = 150;
  const innerR = 140;

  // 红色小圆的显示角度： redAngle = (accumulated + 270) mod 360
  // 这样当 accumulated=0 时，redAngle=270，即红圆显示在顶部
  const redAngle = (accumulated + 270) % 360;
  const redX = centerX + outerR * Math.cos((redAngle * Math.PI) / 180);
  const redY = centerY + outerR * Math.sin((redAngle * Math.PI) / 180);

  // 显示时间：累计0～360对应0～120分钟
  const totalMinutes = Math.round((accumulated / 360) * 120);
  const timeDisplay = totalMinutes.toString().padStart(2, '0') + ":00";

  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  // 计算逻辑角度函数：以 SVG 中的绝对角度（0°在正右）转换，使得顶部为0°
  const computeLogicalAngle = (clientX: number, clientY: number, rect: DOMRect) => {
    const svgCenterX = rect.left + rect.width / 2;
    const svgCenterY = rect.top + rect.height / 2;
    const dx = clientX - svgCenterX;
    const dy = clientY - svgCenterY;
    const absAngle = (Math.atan2(dy, dx) * 180) / Math.PI; // 0°在正右
    // 逻辑角度 = (absAngle + 90) mod360，这样顶部（absAngle=270）得到0
    return ((absAngle + 90) % 360 + 360) % 360;
  };

  // 鼠标按下：记录当前逻辑角度
  const handleMouseDown = (e: React.MouseEvent<SVGCircleElement>) => {
    setDragging(true);
    const svgElem = e.currentTarget.ownerSVGElement as SVGSVGElement;
    const rect = svgElem.getBoundingClientRect();
    const logical = computeLogicalAngle(e.clientX, e.clientY, rect);
    setPrevLogical(logical);
    e.stopPropagation();
  };

  // 拖拽时更新累计角度（允许顺时针增加到360，逆时针减少到0）
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newLogical = computeLogicalAngle(e.clientX, e.clientY, rect);
    let delta = newLogical - prevLogical;
    // 处理跨界问题
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    // 限制正向拖拽累计不超过360，逆向不低于0
    if (delta > 0 && accumulated + delta > 360) {
      delta = 360 - accumulated;
    }
    if (delta < 0 && accumulated + delta < 0) {
      delta = -accumulated;
    }
    setAccumulated(prev => clamp(prev + delta, 0, 360));
    setPrevLogical(newLogical);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  // 构造厚边区域路径：从逻辑0（顶部）到逻辑=accumulated
  let thickPath = "";
  if (accumulated === 360) {
    // 当累计达到360时，绘制整个 annulus
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
    // 外圆终点：逻辑角度 = accumulated，对应绝对角度 = (accumulated - 90)
    const outerEndX = centerX + outerR * Math.cos(((accumulated - 90) * Math.PI) / 180);
    const outerEndY = centerY + outerR * Math.sin(((accumulated - 90) * Math.PI) / 180);
    // 内圆终点：逻辑角度 = accumulated
    const innerEndX = centerX + innerR * Math.cos(((accumulated - 90) * Math.PI) / 180);
    const innerEndY = centerY + innerR * Math.sin(((accumulated - 90) * Math.PI) / 180);
    // 外圆起点（逻辑0，即顶部）：(150, 0)
    const outerStartX = centerX + outerR * Math.cos((-90 * Math.PI) / 180);
    const outerStartY = centerY + outerR * Math.sin((-90 * Math.PI) / 180);
    // 内圆起点（逻辑0）：(150, innerR positioned from top)
    const innerStartX = centerX + innerR * Math.cos((-90 * Math.PI) / 180);
    const innerStartY = centerY + innerR * Math.sin((-90 * Math.PI) / 180);
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
          {/* 为确保完整显示，SVG尺寸设为330x330，viewBox增加边距 */}
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
            {/* 绘制两个同心薄边圆 */}
            <circle cx="150" cy="150" r="150" fill="none" stroke="#000" strokeWidth="2" />
            <circle cx="150" cy="150" r="140" fill="none" stroke="#000" strokeWidth="2" />
            {/* 绘制厚边区域 */}
            {accumulated > 0 && <path d={thickPath} fill="#000" fillRule="evenodd" />}
            {/* 红色小圆（拖拽交互），颜色根据当前标签 */}
            <circle
              cx={redX}
              cy={redY}
              r="10"
              fill={currentColor}
              style={{ cursor: 'pointer' }}
              onMouseDown={handleMouseDown}
            />
            {/* 居中显示时间 */}
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
            {/* 显示标签前的小圆点，颜色根据当前标签 */}
            <span className="tag-dot" style={{ backgroundColor: currentColor }}></span>
            {/* 下拉选择框 */}
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="tag-select"
            >
              {tagOptions.map(option => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button className="start-button">Start</button>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
