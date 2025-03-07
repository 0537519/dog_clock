import { useEffect, useState } from "react";
import { usePomodoroController } from "./hook/usePomodoroController";
import "./Data.css";
import authorImage from "./assets/author.jpg";

const Data = () => {
  const {
    getTotalSessionCount,
    getTotalFocusMinutes,
    getCompletionRate,
    loading,
    error,
  } = usePomodoroController();
  
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [focusMinutes, setFocusMinutes] = useState<number>(0);
  const [completionRate, setCompletionRate] = useState<string>("0.00");

  useEffect(() => {
    const fetchData = async () => {
      const count = await getTotalSessionCount();
      const minutes = await getTotalFocusMinutes();
      const rate = await getCompletionRate();
      
      
      if (count !== null) setSessionCount(count);
      if (minutes !== null) setFocusMinutes(Math.round(Number(minutes)));
      if (rate !== null) setCompletionRate(rate);
    };
    
    fetchData();
  }, []);

  return (
    <div className="data-content">
      <div className="data-image-container">
        <img 
          src={authorImage} 
          alt="Achievement" 
          className="data-image"
        />
      </div>
      
      <div className="stats-container">
        <p className="stats-text">
          {loading ? "Crunching numbers..." : (
            <>
              Awesome! So far you've focused 
              <span className="stats-number">{sessionCount}</span> times
            </>
          )}
        </p>
        
        <p className="stats-text">
          {loading ? "..." : (
            <>
              Clocked in 
              <span className="stats-number">{focusMinutes}</span> minutes total
            </>
          )}
        </p>
        
        <p className="stats-text">
          {loading ? "..." : (
            <>
              Your completion mojo: 
              <span className="stats-number">{completionRate}</span>
            </>
          )}
        </p>
        
        {error && <p className="stats-text" style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
};

export default Data;