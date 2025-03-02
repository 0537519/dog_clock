import { useEffect, useState } from 'react';
import './Shop.css';

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

function ProductModal({ product, onClose }: ModalProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  // 根据产品类型返回对应的 Material Symbols 图标
  const getBonusIcon = (type: string) => {
    if (type === 'hunger') {
      return (
        <span className="material-symbols-outlined bonus-icon">
          pet_supplies
        </span>
      );
    } else if (type === 'mood') {
      return (
        <span className="material-symbols-outlined bonus-icon">
          sentiment_very_satisfied
        </span>
      );
    }
    return null;
  };

  const handleConfirm = () => {
    // 执行购买逻辑（如果有的话）
    setShowConfirm(false);
    onClose();  // 点击确认后关闭整个 modal
  };

  const handlePurchaseClick = () => {
    setShowConfirm(true);
  };


  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
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
                <button className="confirm-button" onClick={handleConfirm}>Confirm</button>
                <button className="cancel-button" onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [hungerIndex, setHungerIndex] = useState(0);
  const [moodIndex, setMoodIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetch('https://localhost:7028/api/products')
      .then(response => {
        if (!response.ok) {
          throw new Error(`网络响应错误: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setProducts(data))
      .catch(error => {
        console.error('获取产品数据失败：', error);
      });
  }, []);

  const productsHunger = products.filter(p => p.type === 'hunger');
  const productsMood = products.filter(p => p.type === 'mood');

  const handleHungerPrev = () => {
    setHungerIndex(prev => Math.max(prev - 1, 0));
  };

  const handleHungerNext = () => {
    const maxStart = Math.max(productsHunger.length - 3, 0);
    setHungerIndex(prev => Math.min(prev + 1, maxStart));
  };

  const handleMoodPrev = () => {
    setMoodIndex(prev => Math.max(prev - 1, 0));
  };

  const handleMoodNext = () => {
    const maxStart = Math.max(productsMood.length - 3, 0);
    setMoodIndex(prev => Math.min(prev + 1, maxStart));
  };

  const handleImageClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="shop-content">
      {selectedProduct && <ProductModal product={selectedProduct} onClose={closeModal} />}
      {/* 第一行： hunger 类型 */}
      <div className="arrow-row">
        <button className="arrow-button left" onClick={handleHungerPrev}>
          &#9664;
        </button>
        <div className="carousel">
          <div
            className="carousel-track"
            style={{ transform: `translateY(20px) translateX(-${hungerIndex * 220}px)` }}
          >
            {productsHunger.map((product, index) => (
              <div key={index} className="product-card">
                <div className="image-container" onClick={() => handleImageClick(product)}>
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

      {/* 第二行： mood 类型 */}
      <div className="arrow-row">
        <button className="arrow-button left" onClick={handleMoodPrev}>
          &#9664;
        </button>
        <div className="carousel">
          <div
            className="carousel-track"
            style={{ transform: `translateY(20px) translateX(-${moodIndex * 220}px)` }}
          >
            {productsMood.map((product, index) => (
              <div key={index} className="product-card">
                <div className="image-container" onClick={() => handleImageClick(product)}>
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

