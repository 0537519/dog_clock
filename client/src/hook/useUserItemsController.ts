import { useState, useEffect } from "react";

export interface UserItem {
  id: number;
  name: string;
  type: string;
  bonus: number;
  price: number;
  prictureUrl: string;
  quantity: number;
}

export interface Product {
  id?: number;
  name: string;
  type: string;
  bonus: number;
  price: number;
  prictureUrl: string;
}

const API_BASE_URL = "https://localhost:7028/api/userItems";
const PETS_API_BASE_URL = "https://localhost:7028/api/Pets";

export function useUserItems() {
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_BASE_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch user items");
        }
        return response.json();
      })
      .then((data: UserItem[]) => {
        setUserItems(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { userItems, loading, error };
}

export async function getUserItem(id: number): Promise<UserItem> {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user item");
  }
  return response.json();
}

export async function purchaseProduct(product: Product): Promise<string> {
  // 确保传入的 price 为整数
  const price = parseInt(product.price.toString(), 10);
  try {
    // 调用余额扣除接口（用户ID固定为1，如有需要请调整）
    const balanceResponse = await fetch(
      "https://localhost:7028/api/user/balance/decrease/1",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(price),
      }
    );
    const balanceText = await balanceResponse.text();
    console.log("Balance response:", balanceResponse.status, balanceText);
    if (!balanceResponse.ok) {
      throw new Error("Insufficient balance");
    }
  } catch (err) {
    console.error("Balance decrease error:", err);
    throw new Error("Insufficient balance");
  }

  try {
    // 调用购买接口
    const response = await fetch(`${API_BASE_URL}/purchase`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    const resultText = await response.text();
    console.log("Purchase response:", response.status, resultText);
    if (!response.ok) {
      throw new Error("Failed to purchase product");
    }
    return resultText;
  } catch (err) {
    console.error("Purchase error:", err);
    throw new Error("Failed to purchase product");
  }
}

export async function consumeItem(id: number): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/consume/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to consume item");
  }
  return response.text();
}

export async function increaseHunger(id: number, amount: number): Promise<number> {
  const response = await fetch(`${PETS_API_BASE_URL}/${id}/increase-hunger`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(amount),
  });
  if (!response.ok) {
    throw new Error("Failed to increase hunger");
  }
  return response.json();
}

export async function increaseMood(id: number, amount: number): Promise<number> {
  const response = await fetch(`${PETS_API_BASE_URL}/${id}/increase-mood`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(amount),
  });
  if (!response.ok) {
    throw new Error("Failed to increase mood");
  }
  return response.json();
}
