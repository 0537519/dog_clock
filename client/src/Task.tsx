import { useEffect, useRef, useState } from 'react';
import { usePomodoroController } from './hook/usePomodoroController';
import './Task.css';

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

interface PomodoroSession {
  id: number;
  taskTag: string;
  startTime: string;
  endTime: string;
  duration: string;
  isCompleted: boolean;
  rewardPoints: number;
}

const Task = () => {
  const { getPomodoroSessions, loading, error } = usePomodoroController();
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false); // 防止初始闪烁

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await getPomodoroSessions();
        if (data) {
          // 反向排序并设置数据
          const reversedData = [...data].reverse();
          setSessions(reversedData);
        }
      } finally {
        initialized.current = true;
      }
    };
    
    if (!initialized.current) {
      loadSessions();
    }
  }, [getPomodoroSessions]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const getTagColor = (tagLabel: string) => {
    return tagOptions.find(t => t.label === tagLabel)?.color || '#cccccc';
  };

  const handleScroll = (direction: 'up' | 'down') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'up' ? -200 : 200;
      scrollRef.current.scrollBy({
        top: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="content-container">
      <div className="scroll-container">
        <button 
          className="scroll-arrow top"
          onClick={() => handleScroll('up')}
          aria-label="Scroll up"
        >
          ▲
        </button>
        
        <div className="sessions-wrapper" ref={scrollRef}>
          {loading && !initialized.current && (
            <div className="loading-text">
              Loading your focus sessions...
            </div>
          )}
          
          {error && (
            <div className="error-text">
              ⚠️ Error loading sessions: {error}
            </div>
          )}

          {!loading && !error && sessions.length > 0 && (
            <div className="history-divider">
              <span className="divider-text">History Record</span>
            </div>
          )}

          {sessions.map((session) => {
            const start = formatDate(session.startTime);
            const end = formatDate(session.endTime);

            return (
              <div 
                key={session.id} 
                className="session-item"
                role="listitem"
              >
                <div className="time-range">
                  <span className="session-date">{start.date}</span>
                  <span className="session-time">
                    {start.time} - {end.time}
                  </span>
                </div>

                <div className="tag-container">
                  <div 
                    className="tag-dot" 
                    style={{ backgroundColor: getTagColor(session.taskTag) }}
                    aria-label="Task category indicator"
                  />
                  <span className="tag-label">
                    {session.taskTag}
                  </span>
                </div>
              </div>
            );
          })}

          {!loading && !error && sessions.length === 0 && (
            <div className="empty-state">
              No focus sessions recorded yet. Start your first pomodoro!
            </div>
          )}
        </div>

        <button 
          className="scroll-arrow bottom"
          onClick={() => handleScroll('down')}
          aria-label="Scroll down"
        >
          ▼
        </button>
      </div>
    </div>
  );
};

export default Task;