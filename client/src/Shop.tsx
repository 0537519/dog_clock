import { useEffect, useState } from "react";
import "./Shop.css";
import { LuBone } from "react-icons/lu";
import { FaRegSmile } from "react-icons/fa";
import { purchaseProduct} from "./hook/useUserItemsController";

interface Product {
  name: string;
  price: number;
  bonus: number;
  type: string;
  prictureUrl: string;
}

interface ModalProps {
  product: Product;
  onClose: () => void;
}

function getBonusIcon(type: string) {
  if (type === "hunger") {
    return (
      <span className="material-symbols-outlined bonus-icon">
        <LuBone />
      </span>
    );
  } else if (type === "mood") {
    return (
      <span className="material-symbols-outlined bonus-icon">
        <FaRegSmile />
      </span>
    );
  }
  return null;
}

function ProductModal({ product, onClose }: ModalProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInsufficient, setShowInsufficient] = useState(false);

  const handleConfirmPurchase = async () => {
    try {
      const result = await purchaseProduct(product);
      console.log(result);
      onClose();
    } catch (error) {
      console.error("Purchase failed", error);
      setShowInsufficient(true);
    }
  };

  const handleConfirmInsufficient = () => {
    setShowInsufficient(false);
  };

  const handlePurchaseClick = () => {
    setShowConfirm(true);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>x</button>
          <div className="modal-body">
            <div className="modal-left">
              <img
                src={product.prictureUrl}
                alt={product.name}
                className="modal-image"
              />
            </div>
            <div className="modal-right">
              <div className="modal-right-top">
                <h2 className="modal-product-name">{product.name}</h2>
              </div>
              <div className="modal-right-middle">
                <div className="modal-price">Price: ${product.price}</div>
                <div className="modal-bonus">
                  Bonus: +{product.bonus} {getBonusIcon(product.type)}
                </div>
              </div>
              <div className="modal-right-bottom">
                <button className="modal-purchase" onClick={handlePurchaseClick}>
                  Buy Now
                </button>
              </div>
            </div>
          </div>
          {showConfirm && (
            <div className="modal-confirm-overlay">
              <div className="modal-confirm-content">
                <div className="modal-confirm-text">Confirm purchase?</div>
                <div className="modal-confirm-buttons">
                  <button
                    className="confirm-button"
                    onClick={handleConfirmPurchase}
                  >
                    Confirm
                  </button>
                  <button
                    className="cancel-button"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  
      {showInsufficient && (
        <div className="modal-confirm-overlay">
          <div className="modal-confirm-content">
            <div className="modal-confirm-text">Insufficient balance</div>
            <div className="modal-confirm-buttons">
              <button
                className="confirm-button"
                onClick={handleConfirmInsufficient}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [hungerIndex, setHungerIndex] = useState(0);
  const [moodIndex, setMoodIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch("https://localhost:7028/api/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setProducts(data))
      .catch((error) => {
        console.error("Failed to fetch products:", error);
      });
  }, []);

  const productsHunger = products.filter((p) => p.type === "hunger");
  const productsMood = products.filter((p) => p.type === "mood");

  const handleHungerPrev = () => {
    setHungerIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleHungerNext = () => {
    const maxStart = Math.max(productsHunger.length - 2, 0);
    setHungerIndex((prev) => Math.min(prev + 1, maxStart));
  };

  const handleMoodPrev = () => {
    setMoodIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleMoodNext = () => {
    const maxStart = Math.max(productsMood.length - 2, 0);
    setMoodIndex((prev) => Math.min(prev + 1, maxStart));
  };

  const handleImageClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="shop-content">
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={closeModal} />
      )}

      <div className="arrow-row">
        <button className="arrow-button left" onClick={handleHungerPrev}>
          &#9664;
        </button>
        <div className="carousel">
          <div
            className="carousel-track"
            style={{
              transform: `translateY(20px) translateX(-${hungerIndex * 220}px)`,
            }}
          >
            {productsHunger.map((product, index) => (
              <div key={index} className="product-card">
                <div
                  className="image-container"
                  onClick={() => handleImageClick(product)}
                >
                  <img
                    src={product.prictureUrl}
                    alt={product.name}
                    className="product-image"
                  />
                </div>
                <div className="product-info">
                  <h2>{product.name}</h2>
                  <p>
                    ${product.price}
                    <span className="bonus">{`+${product.bonus}`}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button className="arrow-button right" onClick={handleHungerNext}>
          &#9654;
        </button>
      </div>

      <div className="arrow-row">
        <button className="arrow-button left" onClick={handleMoodPrev}>
          &#9664;
        </button>
        <div className="carousel">
          <div
            className="carousel-track"
            style={{
              transform: `translateY(20px) translateX(-${moodIndex * 220}px)`,
            }}
          >
            {productsMood.map((product, index) => (
              <div key={index} className="product-card">
                <div
                  className="image-container"
                  onClick={() => handleImageClick(product)}
                >
                  <img
                    src={product.prictureUrl}
                    alt={product.name}
                    className="product-image"
                  />
                </div>
                <div className="product-info">
                  <h2>{product.name}</h2>
                  <p>
                    ${product.price}
                    <span className="bonus">{`+${product.bonus}`}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button className="arrow-button right" onClick={handleMoodNext}>
          &#9654;
        </button>
      </div>
    </div>
  );
}

export default Shop;
