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
  calculateHealthy,
  calculateUnhealthy
} from "./hook/usePetsController";
import { MdPets } from "react-icons/md";
import { LuBone } from "react-icons/lu";
import { FaRegSmile } from "react-icons/fa";
import { GiHealthCapsule } from "react-icons/gi";
import authorImage from "./assets/author.jpg";

function Home() {
  const [showAdoptModal, setShowAdoptModal] = useState<boolean>(false);
  const [showNameModal, setShowNameModal] = useState<boolean>(false);
  const [dogName, setDogName] = useState<string>("");
  const [alivePet, setAlivePet] = useState<Pet | null>(null);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [animationOpacity, setAnimationOpacity] = useState<number>(0);
  const [showDogInfoModal, setShowDogInfoModal] = useState<boolean>(false);
  const [dogAge, setDogAge] = useState<string>("0.0");
  const [infoHunger, setInfoHunger] = useState<number | string>("0");
  const [infoMood, setInfoMood] = useState<number | string>("0");
  // 新增：控制骨头图标弹窗的状态
  const [showBoneModal, setShowBoneModal] = useState<boolean>(false);

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

  // 新增：点击骨头图标时的事件处理，弹出空白弹窗
  const handleBoneClick = () => {
    setShowBoneModal(true);
  };

  useEffect(() => {
    async function checkAlivePet() {
      try {
        const alive = await hasAlivePet();
        if (alive) {
          const pet = await getAlivePet();
          const age = await calculateAge(pet.id);
          console.log("Calculated age:", age);
          if (age > pet.deadAge) {
            await killPet(pet.id);
            await animateImage();
            window.location.reload();
          } else {
            const unhealthy = await calculateUnhealthy(pet.id);
            if (unhealthy) {
              await killPet(pet.id);
              await animateImage();
              window.location.reload();
            } else {
              setAlivePet(pet);
            }
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
  
  const handleCreatePet = async () => {
    try {
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
      {/* 新增：点击骨头图标后弹出的空白弹窗 */}
      {showBoneModal && (
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
              onClick={() => setShowBoneModal(false)}
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
            {/* 空白内容 */}
          </div>
        </div>
      )}
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
          <div className="circle" onClick={handleBoneClick}>
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