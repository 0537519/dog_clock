import { useState, useEffect } from "react";
import axios from "axios";

export function useUserItems() {
  const [userItems, setUserItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserItems = async () => {
    try {
      const response = await axios.get("https://localhost:7028/api/useritems");
      setUserItems(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserItems();
  }, []);

  return { userItems, loading, error, fetchUserItems };
}

export async function purchaseProduct(product) {
  try {
    const response = await axios.post(
      "https://localhost:7028/api/useritems/purchase",
      product,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
