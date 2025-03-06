import { useState, useEffect } from 'react';

// Define the Pet interface corresponding to the backend Pet.cs
export interface Pet {
  id: number;
  name: string;
  level: number;
  exp: number;
  hunger: number;
  mood: number;
  isHealthy: boolean;
  isDead: boolean;
  birthday: string; 
  age: string;   
  deadAge: number;  
}

const API_BASE_URL = 'https://localhost:7028/api/Pets';

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(API_BASE_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch pet list');
        }
        return response.json();
      })
      .then((data: Pet[]) => {
        setPets(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { pets, loading, error };
}

export async function getPet(id: number): Promise<Pet> {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch pet');
  }
  return response.json();
}

export async function createPet(name: string): Promise<Pet> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    // Since the backend binds directly to a string, we send a JSON-formatted string.
    body: JSON.stringify(name)
  });
  if (!response.ok) {
    throw new Error('Failed to create pet');
  }
  return response.json();
}

export async function hasAlivePet(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/alive`);
  if (!response.ok) {
    throw new Error('Failed to check for alive pets');
  }
  return response.json();
}

// New function: Get the first alive pet.
export async function getAlivePet(): Promise<Pet> {
  const response = await fetch(`${API_BASE_URL}/alive-pet`);
  if (!response.ok) {
    throw new Error('Failed to fetch alive pet');
  }
  return response.json();
}

export async function calculateAge(id: number): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/${id}/calculate-age`);
  if (!response.ok) {
    throw new Error('Failed to calculate age');
  }
  return response.json();
}

export async function killPet(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}/mark-dead`, {
    method: 'PUT'
  });
  if (!response.ok) {
    throw new Error('Failed to kill pet');
  }
}

export async function calculateHunger(id: number): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/${id}/calculate-hunger`);
  if (!response.ok) {
    throw new Error('Failed to calculate hunger');
  }
  return response.json();
}

export async function calculateMood(id: number): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/${id}/calculate-mood`);
  if (!response.ok) {
    throw new Error('Failed to calculate mood');
  }
  return response.json();
}

export async function calculateHealthy(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/${id}/calculate-healthy`);
  if (!response.ok) {
    throw new Error('Failed to calculate healthy');
  }
  return response.json();
}

export async function calculateUnhealthy(id: number): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/${id}/calculate-unhealthy`);
  if (!response.ok) {
    throw new Error('Failed to calculate unhealthy');
  }
  return response.json();
}
