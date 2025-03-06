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
  calculateUnhealthy,
} from "./hook/usePetsController";
import {
  consumeItem,
  increaseHunger,
  increaseMood,
} from "./hook/useUserItemsController";
import { MdPets } from "react-icons/md";
import { LuBone } from "react-icons/lu";
import { FaRegSmile } from "react-icons/fa";
import { GiHealthCapsule } from "react-icons/gi";
import authorImage from "./assets/author.jpg";

// 定义 UserItem 接口（注意属性名与后端返回的 JSON 保持一致）
interface UserItem {
  id: number;
  name: string;
  type: string;
  bonus: number;
  price: number;
  prictureUrl: string;
  quantity: number;
}

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
  const [showBoneModal, setShowBoneModal] = useState<boolean>(false);
  const [backpackItems, setBackpackItems] = useState<UserItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // 新增：用于使用背包物品确认窗口（hunger 物品使用，与骨头图标相关）
  const [showUseModal, setShowUseModal] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<UserItem | null>(null);

  // 新增：用于 mood 物品相关
  const [showSmileModal, setShowSmileModal] = useState<boolean>(false);
  const [moodItems, setMoodItems] = useState<UserItem[]>([]);
  const [moodCurrentIndex, setMoodCurrentIndex] = useState<number>(0);
  const [showUseSmileModal, setShowUseSmileModal] = useState<boolean>(false);
  const [selectedSmileItem, setSelectedSmileItem] = useState<UserItem | null>(
    null
  );

  const getBonusIcon = (type: string) => {
    return type.toLowerCase() === "hunger" ? <LuBone /> : "";
  };

  // 当点击 hunger 物品图片时，显示使用确认弹窗
  const handleUseItem = (item: UserItem) => {
    setSelectedItem(item);
    setShowUseModal(true);
  };

  // 当点击 mood 物品图片时，显示使用确认弹窗
  const handleUseSmileItem = (item: UserItem) => {
    setSelectedSmileItem(item);
    setShowUseSmileModal(true);
  };

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
      setAlivePet((prev) =>
        prev ? { ...prev, isHealthy: healthyStatus } : prev
      );
    } catch (error) {
      console.error("Error calculating healthy status: ", error);
    }
    setShowDogInfoModal(true);
  };

  const handleBoneClick = async () => {
    setShowBoneModal(true);
    try {
      const response = await fetch("https://localhost:7028/api/UserItems");
      if (!response.ok) throw new Error("Failed to fetch backpack items");
      const items: UserItem[] = await response.json();
      const hungerItems = items.filter(
        (item) => item.type.toLowerCase() === "hunger"
      );
      setBackpackItems(hungerItems);
    } catch (error) {
      console.error("Error fetching backpack items:", error);
      setBackpackItems([]);
    }
  };

  const handleSmileClick = async () => {
    setShowSmileModal(true);
    try {
      const response = await fetch("https://localhost:7028/api/UserItems");
      if (!response.ok) throw new Error("Failed to fetch backpack items");
      const items: UserItem[] = await response.json();
      const filtered = items.filter(
        (item) => item.type.toLowerCase() === "mood"
      );
      setMoodItems(filtered);
    } catch (error) {
      console.error("Error fetching mood backpack items:", error);
      setMoodItems([]);
    }
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
                style={{ fontSize: "30px", marginBottom: "2px" }}
              >
                <strong>{alivePet.name}</strong>
              </p>
              <p className="modal-text" style={{ marginBottom: "2px" }}>
                <strong>Age:</strong> {dogAge}
              </p>
              <p className="modal-text" style={{ marginBottom: "2px" }}>
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

      {showBoneModal && (
        <div className="modal-overlay" onClick={() => setShowBoneModal(false)}>
          <div
            className="modal-content bone-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowBoneModal(false)}
            >
              ×
            </button>
            <div className="bone-slider-container">
              <div
                className="bone-carousel-track"
                style={{
                  width: `${backpackItems.length * 250}px`,
                  transform: `translateX(-${currentIndex * 250}px)`,
                }}
              >
                {backpackItems.map((item) => (
                  <div key={item.id} className="bone-product-card">
                    <div
                      className="bone-modal-image-container"
                      onClick={() => handleUseItem(item)}
                    >
                      <img
                        src={item.prictureUrl}
                        alt={item.name}
                        className="bone-modal-image"
                      />
                      <div className="bone-modal-info">
                        <h3 className="bone-modal-product-name">{item.name}</h3>
                        <div className="bone-modal-bonus">
                          Bonus: +{item.bonus} {getBonusIcon(item.type)}
                        </div>
                        <div className="bone-modal-quantity">
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="bone-slider-btn left"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              >
                {"<"}
              </button>
              <button
                className="bone-slider-btn right"
                onClick={() =>
                  setCurrentIndex(
                    Math.min(backpackItems.length - 2, currentIndex + 1)
                  )
                }
              >
                {">"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSmileModal && (
        <div className="modal-overlay" onClick={() => setShowSmileModal(false)}>
          <div
            className="modal-content bone-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowSmileModal(false)}
            >
              ×
            </button>
            <div className="bone-slider-container">
              <div
                className="bone-carousel-track"
                style={{
                  width: `${moodItems.length * 250}px`,
                  transform: `translateX(-${moodCurrentIndex * 250}px)`,
                }}
              >
                {moodItems.map((item) => (
                  <div key={item.id} className="bone-product-card">
                    <div
                      className="bone-modal-image-container"
                      onClick={() => handleUseSmileItem(item)}
                    >
                      <img
                        src={item.prictureUrl}
                        alt={item.name}
                        className="bone-modal-image"
                      />
                      <div className="bone-modal-info">
                        <h3 className="bone-modal-product-name">{item.name}</h3>
                        <div className="bone-modal-bonus">
                          Bonus: +{item.bonus} {getBonusIcon(item.type)}
                        </div>
                        <div className="bone-modal-quantity">
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="bone-slider-btn left"
                onClick={() =>
                  setMoodCurrentIndex(Math.max(0, moodCurrentIndex - 1))
                }
              >
                {"<"}
              </button>
              <button
                className="bone-slider-btn right"
                onClick={() =>
                  setMoodCurrentIndex(
                    Math.min(moodItems.length - 2, moodCurrentIndex + 1)
                  )
                }
              >
                {">"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUseModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowUseModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "400px", height: "200px" }}
          >
            <button
              className="modal-close"
              onClick={() => setShowUseModal(false)}
            >
              ×
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: "20px",
                margin: "40px 0",
              }}
            >
              Are you sure you want to use this item?
            </p>
            <button
              className="modal-button"
              style={{ display: "block", margin: "0 auto" }}
              onClick={async () => {
                try {
                  const result = await consumeItem(selectedItem.id);
                  console.log("Consume result:", result);
                  await handleBoneClick();
                  if (alivePet) {
                    const newHunger = await increaseHunger(
                      alivePet.id,
                      selectedItem.bonus
                    );
                    console.log("New Hunger:", newHunger);
                    setAlivePet({ ...alivePet, hunger: newHunger });
                  }
                } catch (error) {
                  console.error("Failed to consume item:", error);
                }
                setShowUseModal(false);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {showUseSmileModal && selectedSmileItem && (
        <div
          className="modal-overlay"
          onClick={() => setShowUseSmileModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ width: "400px", height: "200px" }}
          >
            <button
              className="modal-close"
              onClick={() => setShowUseSmileModal(false)}
            >
              ×
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: "20px",
                margin: "40px 0",
              }}
            >
              Are you sure you want to use this item?
            </p>
            <button
              className="modal-button"
              style={{ display: "block", margin: "0 auto" }}
              onClick={async () => {
                try {
                  const result = await consumeItem(selectedSmileItem.id);
                  console.log("Consume result:", result);
                  // 刷新 mood 背包数据
                  await handleSmileClick();
                  if (alivePet) {
                    const newMood = await increaseMood(
                      alivePet.id,
                      selectedSmileItem.bonus
                    );
                    console.log("New Mood:", newMood);
                    setAlivePet({ ...alivePet, mood: newMood });
                  }
                } catch (error) {
                  console.error("Failed to consume mood item:", error);
                }
                setShowUseSmileModal(false);
              }}
            >
              Confirm
            </button>
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
          <div className="circle" onClick={handleSmileClick}>
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
