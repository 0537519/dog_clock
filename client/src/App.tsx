import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Shop from "./Shop";
import Pomodoro from "./Pomodoro";
import { useState, useEffect } from "react";
import {
  Pet,
  hasAlivePet,
  createPet,
  getAlivePet,
  calculateAge,
  killPet,
  calculateHunger,
  calculateMood,
  calculateHealthy
} from "./hook/usePetsController";
import { MdPets } from "react-icons/md";
import { LuBone } from "react-icons/lu";
import { FaRegSmile } from "react-icons/fa";
import { GiHealthCapsule } from "react-icons/gi";
import authorImage from "./assets/author.jpg";

function Home() {
  // 状态：模态框、宠物名字、活着的宠物
  const [showAdoptModal, setShowAdoptModal] = useState<boolean>(false);
  const [showNameModal, setShowNameModal] = useState<boolean>(false);
  const [dogName, setDogName] = useState<string>("");
  const [alivePet, setAlivePet] = useState<Pet | null>(null);
  // 新增动画相关状态
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [animationOpacity, setAnimationOpacity] = useState<number>(0);
  // 新增状态：显示狗狗信息的浮窗 & 存储计算出来的年龄、hunger、mood
  const [showDogInfoModal, setShowDogInfoModal] = useState<boolean>(false);
  const [dogAge, setDogAge] = useState<string>("0.0");
  const [infoHunger, setInfoHunger] = useState<number | string>("0");
  const [infoMood, setInfoMood] = useState<number | string>("0");

  const animateImage = () => {
    return new Promise((resolve) => {
      setShowAnimation(true);
      let opacity = 0;
      setAnimationOpacity(opacity);
      const fadeInInterval = setInterval(() => {
        opacity += 0.02;
        if (opacity >= 1) {
          opacity = 1;
          setAnimationOpacity(opacity);
          clearInterval(fadeInInterval);
          // 定格 3 秒
          setTimeout(() => {
            let fadeOutOpacity = 1;
            const fadeOutInterval = setInterval(() => {
              fadeOutOpacity -= 0.02;
              if (fadeOutOpacity <= 0) {
                fadeOutOpacity = 0;
                setAnimationOpacity(fadeOutOpacity);
                clearInterval(fadeOutInterval);
                setShowAnimation(false);
                resolve(true);
              } else {
                setAnimationOpacity(fadeOutOpacity);
              }
            }, 50);
          }, 3000);
        } else {
          setAnimationOpacity(opacity);
        }
      }, 50);
    });
  };

  // 点击狗爪图标时，调用 calculateAge、calculateHunger、calculateMood 后显示狗狗信息弹窗
  const handleDogInfoClick = async () => {
    if (!alivePet) return;
    try {
      const ageNum = await calculateAge(alivePet.id);
      setDogAge(ageNum.toFixed(1));
    } catch (error) {
      console.error("Error calculating dog age: ", error);
      setDogAge("N/A");
    }
    try {
      const hungerNum = await calculateHunger(alivePet.id);
      setInfoHunger(hungerNum);
    } catch (error) {
      console.error("Error calculating hunger: ", error);
      setInfoHunger("N/A");
    }
    try {
      const moodNum = await calculateMood(alivePet.id);
      setInfoMood(moodNum);
    } catch (error) {
      console.error("Error calculating mood: ", error);
      setInfoMood("N/A");
    }
    try {
      const healthyStatus = await calculateHealthy(alivePet.id);
 
      setAlivePet(prev => prev ? { ...prev, isHealthy: healthyStatus } : prev);
    } catch (error) {
      console.error("Error calculating healthy status: ", error);
    }
    setShowDogInfoModal(true);
  };

  useEffect(() => {
    // 检查是否存在活着的宠物
    async function checkAlivePet() {
      try {
        const alive = await hasAlivePet();
        if (alive) {
          const pet = await getAlivePet();
          const age = await calculateAge(pet.id);
          console.log("Calculated age:", age);
          // 如果宠物年龄大于其 deadAge，则杀死宠物并播放动画，再刷新页面
          if (age > pet.deadAge) {
            await killPet(pet.id);
            await animateImage();
            window.location.reload();
          } else {
            // 否则正常设置 alivePet，显示四个圆圈
            setAlivePet(pet);
          }
        } else {
          setShowAdoptModal(true);
        }
      } catch (error) {
        console.error("Error checking alive pet:", error);
      }
    }
    checkAlivePet();
  }, []);

  // 模态框中 OK 按钮的处理函数
  const handleCreatePet = async () => {
    try {
      // 限制宠物名字长度，例如 20 个字符
      const trimmedName = dogName.slice(0, 20);
      await createPet(trimmedName);
      setShowNameModal(false);
    } catch (error) {
      console.error("Error creating pet:", error);
    }
  };

  return (
    <div className="content">
      <img src="your-animation.gif" alt="Animation" />
      {showAdoptModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p className="modal-text">Adopt a dog.</p>
            <button
              onClick={() => {
                setShowAdoptModal(false);
                setShowNameModal(true);
              }}
              className="modal-button"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showNameModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p className="modal-text">Please enter a dog's name</p>
            <input
              type="text"
              value={dogName}
              maxLength={20}
              onChange={(e) => setDogName(e.target.value)}
              className="modal-input"
            />
            <button onClick={handleCreatePet} className="modal-button">
              OK
            </button>
          </div>
        </div>
      )}
      {showDogInfoModal && alivePet && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "row",
              padding: "20px",
            }}
          >
            <button
              onClick={() => setShowDogInfoModal(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                border: "none",
                background: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <div
              className="modal-image-container"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={authorImage}
                alt="Author"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  borderRadius: "8px",
                }}
              />
            </div>
            <div
              className="modal-info"
              style={{
                flex: 1,
                textAlign: "left",
                paddingLeft: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <p
                className="modal-text"
                style={{ fontSize: "24px", marginBottom: "3px" }}
              >
                <strong>{alivePet.name}</strong>
              </p>
              <p className="modal-text" style={{ marginBottom: "3px" }}>
                <strong>Age:</strong> {dogAge}
              </p>
              <p className="modal-text" style={{ marginBottom: "3px" }}>
                <strong>Hunger:</strong>{" "}
                <span
                  style={
                    typeof infoHunger === "number" && infoHunger < 30
                      ? { color: "red", fontWeight: "bold" }
                      : {}
                  }
                >
                  {infoHunger}
                </span>
              </p>
              <p className="modal-text" style={{ marginBottom: "3px" }}>
                <strong>Mood:</strong>{" "}
                <span
                  style={
                    typeof infoMood === "number" && infoMood < 30
                      ? { color: "red", fontWeight: "bold" }
                      : {}
                  }
                >
                  {infoMood}
                </span>
              </p>
              <p className="modal-text" style={{ marginBottom: "3px" }}>
                <strong>Status:</strong>{" "}
                <span
                  style={
                    !alivePet.isHealthy
                      ? { color: "red", fontWeight: "bold" }
                      : {}
                  }
                >
                  {alivePet.isHealthy ? "healthy" : "sick"}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
      {/* 图片动画 */}
      {showAnimation && (
        <div
          className="animation-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={authorImage}
            alt="Author"
            style={{
              opacity: animationOpacity,
              transition: "opacity 50ms linear",
            }}
          />
        </div>
      )}
      {alivePet && (
        <div className="icon-container">
          <div className="circle" onClick={handleDogInfoClick}>
            <span className="material-symbols-outlined pets">
              <MdPets />
            </span>
          </div>
          <div className="circle">
            <span className="material-symbols-outlined pet_supplies">
              <LuBone />
            </span>
          </div>
          <div className="circle">
            <span className="material-symbols-outlined ent_very_satisfied">
              <FaRegSmile />
            </span>
          </div>
          <div className="circle">
            <span className="material-symbols-outlined home_health">
              <GiHealthCapsule />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="top-bar">
          <Link className="poppins-regular nav-item" to="/">
            Home
          </Link>
          <Link className="poppins-regular nav-item" to="/pomodoro">
            Pomodoro
          </Link>
          <Link className="poppins-regular nav-item" to="/">
            Task Manager
          </Link>
          <Link className="poppins-regular nav-item" to="/shop">
            Shop
          </Link>
          <Link className="poppins-regular nav-item" to="/">
            Settings
          </Link>
          <Link className="poppins-regular nav-item" to="/">
            Data
          </Link>
        </div>

        <Routes>
          <Route path="/shop" element={<Shop />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/" element={<Home />} />
        </Routes>

        <div className="bottom-bar">&nbsp;</div>
      </div>
    </Router>
  );
}

export default App;
