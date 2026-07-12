import React, { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function AppProvider({ children }) {
  // Authentication states
  const [token, setToken] = useState(() => {
    return localStorage.getItem("avto_savdo_token") || null;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("avto_savdo_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Cars listings state (loaded from backend)
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // Favorites state
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("avto_savdo_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Save favorites to localStorage when changed
  useEffect(() => {
    localStorage.setItem("avto_savdo_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Helper function to normalize cars for compatibility (handling id vs _id, image vs images)
  const normalizeCar = (car) => {
    if (!car) return null;
    const id = car._id || car.id;
    const images = car.images && car.images.length > 0 
      ? car.images 
      : [car.image || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"];
    return {
      ...car,
      id,
      _id: id,
      images,
      image: images[0]
    };
  };

  // Fetch all cars on mount and when token changes
  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/products`);
      if (res.ok) {
        const data = await res.json();
        const normalized = data.map(normalizeCar);
        setCars(normalized);
      } else {
        console.error("Failed to fetch products:", res.statusText);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Login handler
  const login = async (authData) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/telegram`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(authData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Tizimga kirishda xatolik");
      }

      const data = await res.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("avto_savdo_token", data.token);
      localStorage.setItem("avto_savdo_user", JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      console.error("Login request failed:", error);
      throw error;
    }
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("avto_savdo_token");
    localStorage.removeItem("avto_savdo_user");
  };

  // Toggle favorite locally
  const toggleFavorite = (carId) => {
    setFavorites((prev) => {
      if (prev.includes(carId)) {
        return prev.filter((id) => id !== carId);
      } else {
        return [...prev, carId];
      }
    });
  };

  // Add car to backend
  const addCar = async (newCar) => {
    if (!token) {
      throw new Error("E'lon qo'shish uchun tizimga kiring");
    }

    try {
      // Ensure backend receives images array
      const carToSend = {
        ...newCar,
        images: newCar.images || (newCar.image ? [newCar.image] : [])
      };

      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(carToSend),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "E'lonni saqlashda xatolik yuz berdi");
      }

      const createdCar = await res.json();
      const normalizedCar = normalizeCar(createdCar);
      // Prepend the new car to the local state list
      setCars((prev) => [normalizedCar, ...prev]);
      return normalizedCar;
    } catch (error) {
      console.error("Add car error:", error);
      throw error;
    }
  };

  // Delete car from backend
  const deleteCar = async (carId) => {
    if (!token) {
      throw new Error("E'lonni o'chirish uchun tizimga kiring");
    }

    try {
      const res = await fetch(`${API_URL}/api/products/${carId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "E'lonni o'chirishda xatolik yuz berdi");
      }

      setCars((prev) => prev.filter((car) => car._id !== carId));
      setFavorites((prev) => prev.filter((id) => id !== carId));
    } catch (error) {
      console.error("Delete car error:", error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        token,
        user,
        cars,
        loading,
        favorites,
        login,
        logout,
        toggleFavorite,
        addCar,
        deleteCar,
        refreshCars: fetchCars,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
