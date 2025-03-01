import { useEffect, useState } from 'react';
import './Shop.css';

interface Product {
  name: string;
  price: number;
  type: string;
}

function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [hungerIndex, setHungerIndex] = useState(0);
  const [moodIndex, setMoodIndex] = useState(0);

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

  return (
    <div className="shop-content">
      {/* 第一行： hunger 类型 */}
      <div className="arrow-row">
        <button className="arrow-button left" onClick={handleHungerPrev}>
          &#9664;
        </button>
        <div className="carousel">
          <div
            className="carousel-track"
            style={{
              transform: `translateX(-${hungerIndex * 220}px)`,
            }}
          >
            {productsHunger.map((product, index) => (
              <div key={index} className="product-card">
                <h2>{product.name}</h2>
                <p>${product.price}</p>
                <button>Add to Cart</button>
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
            style={{
              transform: `translateX(-${moodIndex * 220}px)`,
            }}
          >
            {productsMood.map((product, index) => (
              <div key={index} className="product-card">
                <h2>{product.name}</h2>
                <p>${product.price}</p>
                <button>Add to Cart</button>
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
