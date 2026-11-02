import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

// Your PC's LAN IP (run `ipconfig`). Phone and PC must be on the same Wi-Fi.
// Android emulator: use "http://10.0.2.2:5000" instead.
const API_URL = "http://192.168.0.101:5000";

const TOKEN_KEY = "mealmind_auth_token";
const USER_KEY = "mealmind_auth_user";

const GREEN = "#315B3B";
const LIGHT_GREEN = "#E9F0E4";
const DARK = "#26352A";
const MUTED = "#7D887D";

const RECIPES = [
  {
    id: "1",
    name: "Paneer Butter Masala",
    category: "Lunch",
    foodType: "Veg",
    region: "North Indian",
    time: 30,
    protein: 18,
    emoji: "🍛",
    color: "#F8E7D4",
    ingredients: ["Paneer", "Tomato", "Onion", "Butter", "Cream", "Spices"],
    steps: [
      "Heat butter in a pan and sauté chopped onions.",
      "Add tomato puree and cook with spices.",
      "Add paneer cubes and simmer for 5 minutes.",
      "Finish with cream and serve hot.",
    ],
  },
  {
    id: "2",
    name: "Masala Oats",
    category: "Breakfast",
    foodType: "Veg",
    region: "Indian",
    time: 15,
    protein: 12,
    emoji: "🥣",
    color: "#E9EEDB",
    ingredients: ["Oats", "Onion", "Tomato", "Carrot", "Peas", "Spices"],
    steps: [
      "Sauté onion and vegetables in a pan.",
      "Add oats, water and spices.",
      "Cook until soft and creamy.",
      "Garnish with coriander and serve.",
    ],
  },
  {
    id: "3",
    name: "Moong Dal Chilla",
    category: "Breakfast",
    foodType: "Veg",
    region: "North Indian",
    time: 20,
    protein: 16,
    emoji: "🥞",
    color: "#F5E9D5",
    ingredients: ["Moong Dal", "Ginger", "Green Chilli", "Coriander", "Salt"],
    steps: [
      "Soak moong dal and blend into a smooth batter.",
      "Mix in ginger, chilli, coriander and salt.",
      "Spread batter on a hot pan.",
      "Cook both sides until golden.",
    ],
  },
  {
    id: "4",
    name: "Vegetable Pulao",
    category: "Lunch",
    foodType: "Veg",
    region: "Indian",
    time: 25,
    protein: 8,
    emoji: "🍚",
    color: "#F3E8D7",
    ingredients: ["Rice", "Carrot", "Beans", "Peas", "Onion", "Spices"],
    steps: [
      "Wash and soak rice.",
      "Sauté onions and vegetables with whole spices.",
      "Add rice and water.",
      "Cook until the rice is fluffy.",
    ],
  },
  {
    id: "5",
    name: "Poha",
    category: "Breakfast",
    foodType: "Veg",
    region: "Maharashtrian",
    time: 15,
    protein: 7,
    emoji: "🍋",
    color: "#F7EBD3",
    ingredients: ["Poha", "Onion", "Peanuts", "Mustard Seeds", "Curry Leaves"],
    steps: [
      "Rinse poha and keep aside.",
      "Heat oil and add mustard seeds and curry leaves.",
      "Add onion and peanuts.",
      "Mix poha with turmeric and salt.",
      "Garnish with coriander and lemon.",
    ],
  },
  {
    id: "6",
    name: "Palak Paneer",
    category: "Lunch",
    foodType: "Veg",
    region: "North Indian",
    time: 30,
    protein: 17,
    emoji: "🥬",
    color: "#E4EFDF",
    ingredients: ["Spinach", "Paneer", "Onion", "Tomato", "Garlic", "Spices"],
    steps: [
      "Blanch spinach and blend into a puree.",
      "Sauté onion, garlic and tomato.",
      "Add spinach puree and spices.",
      "Add paneer cubes and simmer.",
    ],
  },
  {
    id: "7",
    name: "Sprouts Salad",
    category: "Snacks",
    foodType: "Veg",
    region: "Indian",
    time: 10,
    protein: 11,
    emoji: "🥗",
    color: "#E5F0DF",
    ingredients: ["Moong Sprouts", "Tomato", "Onion", "Cucumber", "Lemon"],
    steps: [
      "Steam sprouts until slightly tender.",
      "Chop vegetables.",
      "Mix everything in a bowl.",
      "Add lemon juice, salt and chaat masala.",
    ],
  },
  {
    id: "8",
    name: "Chickpea Chaat",
    category: "Snacks",
    foodType: "Veg",
    region: "Indian",
    time: 15,
    protein: 13,
    emoji: "🥙",
    color: "#F5E9D5",
    ingredients: ["Boiled Chickpeas", "Onion", "Tomato", "Lemon", "Chaat Masala"],
    steps: [
      "Boil chickpeas until soft.",
      "Chop onion and tomato.",
      "Mix chickpeas with vegetables.",
      "Add lemon and chaat masala.",
    ],
  },
  {
    id: "9",
    name: "Idli Sambar",
    category: "Breakfast",
    foodType: "Veg",
    region: "South Indian",
    time: 30,
    protein: 12,
    emoji: "🥥",
    color: "#F1EBDD",
    ingredients: ["Idli Batter", "Toor Dal", "Vegetables", "Tamarind", "Spices"],
    steps: [
      "Steam idli batter in moulds.",
      "Cook toor dal until soft.",
      "Prepare sambar with vegetables and tamarind.",
      "Serve hot with idlis.",
    ],
  },
  {
    id: "10",
    name: "Masala Dosa",
    category: "Breakfast",
    foodType: "Veg",
    region: "South Indian",
    time: 25,
    protein: 9,
    emoji: "🥞",
    color: "#F5E4C8",
    ingredients: ["Dosa Batter", "Potatoes", "Onion", "Mustard Seeds", "Spices"],
    steps: [
      "Prepare potato masala with onions and spices.",
      "Spread dosa batter on a hot pan.",
      "Cook until crisp.",
      "Add potato masala and fold.",
    ],
  },
  {
    id: "11",
    name: "Rajma Chawal",
    category: "Lunch",
    foodType: "Veg",
    region: "North Indian",
    time: 40,
    protein: 10,
    emoji: "🍲",
    color: "#F0E2D8",
    ingredients: ["Rajma", "Rice", "Tomato", "Onion", "Ginger", "Spices"],
    steps: [
      "Soak rajma overnight.",
      "Pressure cook until soft.",
      "Prepare onion tomato masala.",
      "Add rajma and simmer.",
      "Serve with steamed rice.",
    ],
  },
  {
    id: "12",
    name: "Vegetable Khichdi",
    category: "Dinner",
    foodType: "Veg",
    region: "Indian",
    time: 25,
    protein: 15,
    emoji: "🍚",
    color: "#F1E9D9",
    ingredients: ["Rice", "Moong Dal", "Carrot", "Peas", "Turmeric", "Ghee"],
    steps: [
      "Wash rice and dal.",
      "Add vegetables and turmeric.",
      "Pressure cook until soft.",
      "Finish with ghee.",
    ],
  },
  {
    id: "13",
    name: "Egg Bhurji",
    category: "Breakfast",
    foodType: "Non-Veg",
    region: "Indian",
    time: 15,
    protein: 19,
    emoji: "🍳",
    color: "#F8E8D0",
    ingredients: ["Eggs", "Onion", "Tomato", "Green Chilli", "Coriander"],
    steps: [
      "Sauté onion and chilli.",
      "Add tomato and spices.",
      "Crack eggs into the pan.",
      "Scramble until cooked.",
    ],
  },
  {
    id: "14",
    name: "Chicken Curry",
    category: "Lunch",
    foodType: "Non-Veg",
    region: "Indian",
    time: 40,
    protein: 25,
    emoji: "🍗",
    color: "#F3DFD0",
    ingredients: ["Chicken", "Onion", "Tomato", "Ginger", "Garlic", "Spices"],
    steps: [
      "Marinate chicken with spices.",
      "Sauté onion, ginger and garlic.",
      "Add tomato and cook the masala.",
      "Add chicken and cook thoroughly.",
      "Garnish with coriander.",
    ],
  },
  {
    id: "15",
    name: "Chicken Rice Bowl",
    category: "Dinner",
    foodType: "Non-Veg",
    region: "Indian",
    time: 30,
    protein: 32,
    emoji: "🍱",
    color: "#F0E5D5",
    ingredients: ["Chicken", "Rice", "Capsicum", "Onion", "Spices"],
    steps: [
      "Cook rice separately.",
      "Season and cook chicken thoroughly.",
      "Sauté vegetables.",
      "Serve chicken and vegetables over rice.",
    ],
  },
  {
    id: "16",
    name: "Grilled Chicken",
    category: "Dinner",
    foodType: "Non-Veg",
    region: "Continental",
    time: 35,
    protein: 30,
    emoji: "🍗",
    color: "#F3E2D4",
    ingredients: ["Chicken Breast", "Yogurt", "Garlic", "Lemon", "Pepper"],
    steps: [
      "Marinate chicken with yogurt and spices.",
      "Preheat grill or pan.",
      "Cook chicken thoroughly on both sides.",
      "Rest briefly and serve.",
    ],
  },
  {
    id: "17",
    name: "Boiled Egg Salad",
    category: "Snacks",
    foodType: "Non-Veg",
    region: "Indian",
    time: 15,
    protein: 17,
    emoji: "🥚",
    color: "#F5EBD8",
    ingredients: ["Eggs", "Lettuce", "Tomato", "Cucumber", "Lemon"],
    steps: [
      "Boil eggs until fully cooked.",
      "Chop fresh vegetables.",
      "Slice eggs.",
      "Combine and season with lemon and pepper.",
    ],
  },
  {
    id: "18",
    name: "Fish Curry",
    category: "Lunch",
    foodType: "Non-Veg",
    region: "Coastal Indian",
    time: 30,
    protein: 34,
    emoji: "🐟",
    color: "#E2EBE8",
    ingredients: ["Fish", "Coconut Milk", "Onion", "Tomato", "Spices"],
    steps: [
      "Prepare onion and tomato masala.",
      "Add coconut milk and spices.",
      "Add fish pieces carefully.",
      "Simmer until fish is fully cooked.",
    ],
  },
  {
    id: "19",
    name: "Chicken Tikka",
    category: "Snacks",
    foodType: "Non-Veg",
    region: "North Indian",
    time: 30,
    protein: 28,
    emoji: "🍢",
    color: "#F3E1D2",
    ingredients: ["Chicken", "Yogurt", "Ginger Garlic Paste", "Spices", "Lemon"],
    steps: [
      "Marinate chicken in yogurt and spices.",
      "Thread pieces onto skewers.",
      "Grill or cook until thoroughly done.",
      "Serve with lemon and mint chutney.",
    ],
  },
  {
    id: "20",
    name: "Omelette",
    category: "Breakfast",
    foodType: "Non-Veg",
    region: "Indian",
    time: 10,
    protein: 29,
    emoji: "🍳",
    color: "#F8EBD2",
    ingredients: ["Eggs", "Onion", "Tomato", "Green Chilli", "Coriander"],
    steps: [
      "Beat eggs with salt and pepper.",
      "Add chopped vegetables.",
      "Pour into a hot greased pan.",
      "Cook both sides until done.",
    ],
  },
];

const CATEGORIES = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"];

// Approximate nutrition values per serving.
const NUTRITION_DATA = {
  "1": { calories: 390, protein: 18, carbs: 16, fat: 29 },
  "2": { calories: 220, protein: 12, carbs: 34, fat: 5 },
  "3": { calories: 180, protein: 16, carbs: 22, fat: 5 },
  "4": { calories: 310, protein: 14, carbs: 45, fat: 9 },
  "5": { calories: 280, protein: 7, carbs: 51, fat: 6 },
  "6": { calories: 290, protein: 17, carbs: 14, fat: 19 },
  "7": { calories: 190, protein: 11, carbs: 25, fat: 6 },
  "8": { calories: 240, protein: 13, carbs: 32, fat: 8 },
  "9": { calories: 150, protein: 12, carbs: 23, fat: 3 },
  "10": { calories: 310, protein: 9, carbs: 43, fat: 13 },
  "11": { calories: 260, protein: 10, carbs: 42, fat: 6 },
  "12": { calories: 230, protein: 15, carbs: 27, fat: 8 },
  "13": { calories: 240, protein: 19, carbs: 4, fat: 16 },
  "14": { calories: 280, protein: 25, carbs: 25, fat: 9 },
  "15": { calories: 480, protein: 32, carbs: 52, fat: 14 },
  "16": { calories: 430, protein: 30, carbs: 18, fat: 27 },
  "17": { calories: 260, protein: 17, carbs: 12, fat: 16 },
  "18": { calories: 260, protein: 34, carbs: 8, fat: 10 },
  "19": { calories: 320, protein: 28, carbs: 12, fat: 19 },
  "20": { calories: 300, protein: 29, carbs: 10, fat: 16 },
};

const DAILY_GOALS = {
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 65,
};

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// --------------------------------------------------
// API HELPER (adds timeout, JSON handling and auth header)
// --------------------------------------------------

class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.status = status;
  }
}

const apiRequest = async (path, { method = "GET", token, body, timeout = 20000 } = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      throw new ApiError(data.error || data.message || "Something went wrong.", response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error.name === "AbortError") {
      throw new ApiError("The server took too long to respond. Please try again.");
    }

    throw new ApiError(
      "Cannot reach the server. Make sure the Flask backend is running and your phone is on the same Wi-Fi as your computer."
    );
  } finally {
    clearTimeout(timer);
  }
};

// --------------------------------------------------
// LOGIN / SIGN UP SCREEN
// --------------------------------------------------

function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";

  const submit = async () => {
    const cleanEmail = email.replace(/[\s\u200B-\u200D\uFEFF]/g, "").toLowerCase();
    const cleanName = name.trim();

    if (!isLogin && cleanName.length < 2) {
      Alert.alert("Missing name", "Please enter your full name.");
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail)) {
    Alert.alert("Invalid email", `We read: "${cleanEmail}"\n\nIt must look like name@example.com`);  
      return
    }

    if (password.length < 8) {
      Alert.alert("Weak password", "Password must contain at least 8 characters.");
      return;
    }

    setBusy(true);

    try {
      const data = await apiRequest(isLogin ? "/login" : "/register", {
        method: "POST",
        body: isLogin
          ? { email: cleanEmail, password }
          : { name: cleanName, email: cleanEmail, password },
      });

      await onAuthSuccess(data.token, data.user);
    } catch (error) {
      Alert.alert(isLogin ? "Login failed" : "Sign up failed", error.message);
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#F7F8F3" barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.authContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authLogo}>
            <Text style={{ fontSize: 40 }}>🥑</Text>
          </View>
          <Text style={styles.brand}>
            MEALMIND <Text style={{ color: "#91AA7D" }}>AI</Text>
          </Text>
          <Text style={styles.authTitle}>
            {isLogin ? "Welcome back" : "Create your account"}
          </Text>
          <Text style={styles.authSubtitle}>
            {isLogin
              ? "Log in to access your recipes, meal plan and AI Chef."
              : "Sign up to save recipes and plan your meals."}
          </Text>

          <View style={styles.authCard}>
            {!isLogin && (
              <>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.authInput}
                  placeholder="e.g. Jatin Patil"
                  placeholderTextColor="#9BA49A"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </>
            )}

            <Text style={[styles.inputLabel, isLogin && { marginTop: 0 }]}>EMAIL</Text>
            <TextInput
              style={styles.authInput}
              placeholder="you@example.com"
              placeholderTextColor="#9BA49A"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.authInput, { flex: 1, marginBottom: 0 }]}
                placeholder="At least 8 characters"
                placeholderTextColor="#9BA49A"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={submit}
              />
              <TouchableOpacity
                style={styles.showButton}
                onPress={() => setShowPassword((v) => !v)}
              >
                <Text style={styles.showButtonText}>{showPassword ? "Hide" : "Show"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, busy && { opacity: 0.6 }, { marginTop: 22 }]}
              onPress={submit}
              disabled={busy}
            >
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isLogin ? "Log in" : "Create account"}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setMode(isLogin ? "signup" : "login")}
            disabled={busy}
          >
            <Text style={styles.authSwitch}>
              {isLogin ? "New to MealMind? " : "Already have an account? "}
              <Text style={{ color: GREEN, fontWeight: "900" }}>
                {isLogin ? "Sign up" : "Log in"}
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --------------------------------------------------
// MAIN APP (shown only after login)
// --------------------------------------------------

function MealMindMain({ user, token, onLogout }) {
  const userId = user.id;
  const firstName = (user.name || "there").split(" ")[0];

  const KEYS = {
    saved: `mealmind_saved_${userId}`,
    plan: `mealmind_plan_${userId}`,
    groceries: `mealmind_groceries_${userId}`,
    ai: `mealmind_ai_recipes_${userId}`,
  };

  const [tab, setTab] = useState("Home");
  const [saved, setSaved] = useState([]);
  const [mealPlan, setMealPlan] = useState({});
  const [groceries, setGroceries] = useState([]);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [storageReady, setStorageReady] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [foodFilter, setFoodFilter] = useState("All");
  const [highProtein, setHighProtein] = useState(false);

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [newItem, setNewItem] = useState("");

  const [aiIngredients, setAiIngredients] = useState("");
  const [aiPreference, setAiPreference] = useState("Any");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecipe, setAiRecipe] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedData, planData, groceryData, aiData] = await Promise.all([
          AsyncStorage.getItem(KEYS.saved),
          AsyncStorage.getItem(KEYS.plan),
          AsyncStorage.getItem(KEYS.groceries),
          AsyncStorage.getItem(KEYS.ai),
        ]);

        if (savedData) setSaved(JSON.parse(savedData));
        if (planData) setMealPlan(JSON.parse(planData));
        if (groceryData) setGroceries(JSON.parse(groceryData));
        if (aiData) setGeneratedRecipes(JSON.parse(aiData));
      } catch (error) {
        console.log("Error loading saved data:", error);
      } finally {
        setStorageReady(true);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!storageReady) return;
    AsyncStorage.setItem(KEYS.saved, JSON.stringify(saved)).catch(console.log);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    AsyncStorage.setItem(KEYS.plan, JSON.stringify(mealPlan)).catch(console.log);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealPlan, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    AsyncStorage.setItem(KEYS.groceries, JSON.stringify(groceries)).catch(console.log);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groceries, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    AsyncStorage.setItem(KEYS.ai, JSON.stringify(generatedRecipes)).catch(console.log);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedRecipes, storageReady]);

  const allRecipes = [...RECIPES, ...generatedRecipes];

  const filteredRecipes = RECIPES.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || recipe.category === category;
    const matchesProtein = !highProtein || recipe.protein >= 15;
    const matchesFood = foodFilter === "All" || recipe.foodType === foodFilter;

    return matchesSearch && matchesCategory && matchesProtein && matchesFood;
  });

  const confirmLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: onLogout },
    ]);
  };

  const toggleSaved = (recipeId) => {
    setSaved((old) =>
      old.includes(recipeId)
        ? old.filter((id) => id !== recipeId)
        : [...old, recipeId]
    );
  };

  const addRecipeIngredients = (recipe) => {
    const newIngredients = recipe.ingredients.map((name) => ({
      id: `${Date.now()}-${Math.random()}`,
      name,
      checked: false,
    }));

    setGroceries((old) => {
      const existingNames = old.map((item) => item.name.toLowerCase());
      const uniqueItems = newIngredients.filter(
        (item) => !existingNames.includes(item.name.toLowerCase())
      );
      return [...old, ...uniqueItems];
    });

    Alert.alert("Added to groceries", "Recipe ingredients have been added to your list.");
  };

  const addToMealPlan = (recipe) => {
    const todayKey = getLocalDateKey();
    setMealPlan((old) => ({ ...old, [todayKey]: recipe.id }));
    Alert.alert("Meal planned!", `${recipe.name} has been added to today's plan.`);
  };

  const addGroceryItem = () => {
    if (!newItem.trim()) return;

    setGroceries((old) => [
      ...old,
      {
        id: `${Date.now()}`,
        name: newItem.trim(),
        checked: false,
      },
    ]);

    setNewItem("");
  };

  const toggleGrocery = (id) => {
    setGroceries((old) =>
      old.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const deleteGrocery = (id) => {
    setGroceries((old) => old.filter((item) => item.id !== id));
  };

  const generateAIRecipe = async () => {
    if (!aiIngredients.trim()) {
      Alert.alert("Missing ingredients", "Please enter some ingredients first.");
      return;
    }

    setAiLoading(true);
    setAiRecipe(null);

    try {
      const data = await apiRequest("/generate-recipe", {
        method: "POST",
        token,
        timeout: 60000,
        body: {
          ingredients: aiIngredients.trim(),
          preference: aiPreference,
        },
      });

      if (!data.recipe) {
        throw new ApiError("The AI did not return a recipe. Please try again.");
      }

      const recipe = {
        id: `ai-${Date.now()}`,
        name: "My AI Chef Recipe",
        category: "AI Recipe",
        foodType: aiPreference === "Any" ? "AI Generated" : aiPreference,
        region: "MealMind AI",
        time: 25,
        protein: 0,
        emoji: aiPreference === "Non-Veg" ? "🍗" : "👨‍🍳",
        color: "#E5EFDF",
        ingredients: aiIngredients
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        steps: [data.recipe],
      };

      setAiRecipe(recipe);
    } catch (error) {
      if (error.status === 401) {
        Alert.alert("Session expired", "Please log in again.", [
          { text: "OK", onPress: onLogout },
        ]);
      } else {
        Alert.alert("Recipe generation failed", error.message);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const saveAIRecipe = () => {
    if (!aiRecipe) return;

    setGeneratedRecipes((old) => {
      if (old.some((recipe) => recipe.id === aiRecipe.id)) return old;
      return [...old, aiRecipe];
    });

    setSaved((old) =>
      old.includes(aiRecipe.id) ? old : [...old, aiRecipe.id]
    );

    Alert.alert("Recipe saved!", "You can find it in your Saved recipes.");
  };

  const today = new Date();
  const todayKey = getLocalDateKey(today);
  const todayRecipeId = mealPlan[todayKey];
  const todayRecipe = allRecipes.find((recipe) => recipe.id === todayRecipeId);

  const todayNutrition = todayRecipe
    ? NUTRITION_DATA[todayRecipe.id] || null
    : null;

  const getProgress = (value, goal) =>
    Math.min((value / goal) * 100, 100);

  const NutritionProgress = ({ label, value, goal, unit, color }) => (
    <View style={styles.nutritionProgress}>
      <View style={styles.nutritionProgressHeader}>
        <Text style={styles.nutritionLabel}>{label}</Text>
        <Text style={styles.nutritionValue}>
          {value} / {goal} {unit}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${getProgress(value, goal)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );

  const header = (title, subtitle) => (
    <View style={styles.header}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={styles.brand}>
          MEALMIND <Text style={{ color: "#91AA7D" }}>AI</Text>
        </Text>
        <Text style={styles.pageTitle}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.headerIcon}>
          <Text style={{ fontSize: 25 }}>🥑</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const recipeCard = (recipe) => (
    <TouchableOpacity
      key={recipe.id}
      style={styles.recipeCard}
      activeOpacity={0.85}
      onPress={() => setSelectedRecipe(recipe)}
    >
      <View style={[styles.recipeImage, { backgroundColor: recipe.color || LIGHT_GREEN }]}>
        <Text style={styles.recipeEmoji}>{recipe.emoji || "🍽️"}</Text>
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => toggleSaved(recipe.id)}
        >
          <Text style={styles.heartText}>
            {saved.includes(recipe.id) ? "♥" : "♡"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recipeInfo}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <Text
            style={[
              styles.foodBadge,
              recipe.foodType === "Non-Veg" ? styles.nonVegBadge : styles.vegBadge,
            ]}
          >
            {recipe.foodType === "Non-Veg" ? "● Non-Veg" : "● Veg"}
          </Text>
        </View>
        <Text style={styles.recipeMeta}>
          ⏱ {recipe.time || 25} min  ·  💪 {recipe.protein || 0}g protein
        </Text>
        <View style={styles.recipeBottom}>
          <Text style={styles.categoryTag}>{recipe.category}</Text>
          <Text style={styles.viewText}>View recipe →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHome = () => (
    <>
      {header("Eat better, every day.", `Welcome back, ${firstName}!`)}

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>YOUR DAILY FOOD COMPANION</Text>
        <Text style={styles.heroTitle}>Good food.{"\n"}Better habits.</Text>
        <Text style={styles.heroDescription}>
          Discover veg and non-veg recipes, plan meals and cook smarter with AI.
        </Text>
        <TouchableOpacity
          style={styles.heroButton}
          onPress={() => setTab("Recipes")}
        >
          <Text style={styles.heroButtonText}>Explore recipes →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickStats}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>20+</Text>
          <Text style={styles.statLabel}>Recipes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>AI</Text>
          <Text style={styles.statLabel}>Smart Chef</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{saved.length}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Popular recipes</Text>
        <TouchableOpacity onPress={() => setTab("Recipes")}>
          <Text style={styles.viewText}>See all →</Text>
        </TouchableOpacity>
      </View>

      {RECIPES.slice(0, 3).map(recipeCard)}

      <View style={styles.homeFeature}>
        <Text style={styles.homeFeatureEmoji}>✨</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.todayName}>Meet your AI Chef</Text>
          <Text style={styles.muted}>
            Enter ingredients and get a recipe made just for you.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.smallGreenButton}
          onPress={() => setTab("AI Chef")}
        >
          <Text style={styles.smallGreenButtonText}>Try</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderRecipes = () => (
    <>
      {header("Explore recipes", "Find something delicious to cook.")}

      <TextInput
        style={styles.searchInput}
        placeholder="Search recipes..."
        placeholderTextColor="#9BA49A"
        value={search}
        onChangeText={setSearch}
      />

      <Text style={styles.filterHeading}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          {CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterChip,
                category === item && styles.activeFilterChip,
              ]}
              onPress={() => setCategory(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  category === item && styles.activeFilterText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Text style={styles.filterHeading}>Food preference</Text>
      <View style={styles.filterRow}>
        {["All", "Veg", "Non-Veg"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.filterChip,
              foodFilter === item && styles.activeFilterChip,
            ]}
            onPress={() => setFoodFilter(item)}
          >
            <Text
              style={[
                styles.filterText,
                foodFilter === item && styles.activeFilterText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.proteinToggle, highProtein && styles.proteinToggleActive]}
        onPress={() => setHighProtein(!highProtein)}
      >
        <Text style={[styles.proteinToggleText, highProtein && { color: "#FFFFFF" }]}>
          💪 High protein recipes (15g+)
        </Text>
        <Text style={[styles.proteinToggleText, highProtein && { color: "#FFFFFF" }]}>
          {highProtein ? "ON" : "OFF"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.resultsText}>
        {filteredRecipes.length} recipes found
      </Text>

      {filteredRecipes.length > 0 ? (
        filteredRecipes.map(recipeCard)
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔎</Text>
          <Text style={styles.todayName}>No recipes found</Text>
          <Text style={styles.muted}>Try changing your search or filters.</Text>
        </View>
      )}
    </>
  );

  const renderAIChef = () => (
    <>
      {header("AI Chef", "Create recipes using ingredients you have.")}

      <View style={styles.aiCard}>
        <Text style={styles.aiCardTitle}>👨‍🍳 What's in your kitchen?</Text>
        <Text style={styles.muted}>
          Enter ingredients separated by commas. Your AI Chef will create a recipe.
        </Text>

        <Text style={styles.inputLabel}>YOUR INGREDIENTS</Text>
        <TextInput
          style={[styles.searchInput, styles.aiInput]}
          placeholder="e.g. paneer, tomato, onion, capsicum"
          placeholderTextColor="#9BA49A"
          value={aiIngredients}
          onChangeText={setAiIngredients}
          multiline
        />

        <Text style={styles.inputLabel}>FOOD PREFERENCE</Text>
        <View style={styles.filterRow}>
          {["Any", "Veg", "Non-Veg"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterChip,
                aiPreference === item && styles.activeFilterChip,
              ]}
              onPress={() => setAiPreference(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  aiPreference === item && styles.activeFilterText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>QUICK INGREDIENT IDEAS</Text>
        <View style={styles.quickPromptRow}>
          {[
            { label: "🧀 Paneer", value: "Paneer, onion, tomato, capsicum" },
            { label: "🍗 Chicken", value: "Chicken, yogurt, ginger, garlic" },
            { label: "🥚 Eggs", value: "Eggs, onion, tomato, green chilli" },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.quickPrompt}
              onPress={() => {
                setAiIngredients(item.value);
                setAiPreference(
                  item.value.includes("Chicken") || item.value.includes("Eggs")
                    ? "Non-Veg"
                    : "Veg"
                );
              }}
            >
              <Text style={styles.quickPromptText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, aiLoading && { opacity: 0.6 }]}
          onPress={generateAIRecipe}
          disabled={aiLoading}
        >
          <Text style={styles.primaryButtonText}>
            {aiLoading ? "Creating your recipe..." : "✨ Generate AI Recipe"}
          </Text>
        </TouchableOpacity>
      </View>

      {aiLoading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={styles.aiLoading}>
            Your AI chef is preparing something delicious...
          </Text>
        </View>
      )}

      {aiRecipe && (
        <View style={styles.aiResult}>
          <Text style={styles.aiResultTitle}>🍛 Your AI-generated recipe</Text>
          <Text style={styles.recipeName}>{aiRecipe.name}</Text>

          <Text style={styles.sectionTitle}>Ingredients you entered</Text>
          {aiRecipe.ingredients.map((item, index) => (
            <Text key={index} style={styles.aiText}>• {item}</Text>
          ))}

          <Text style={styles.sectionTitle}>Recipe and instructions</Text>
          <Text style={styles.aiText}>{aiRecipe.steps[0]}</Text>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => addRecipeIngredients(aiRecipe)}
          >
            <Text style={styles.secondaryButtonText}>＋ Add ingredients to groceries</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={saveAIRecipe}>
            <Text style={styles.primaryButtonText}>♡ Save AI Recipe</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>💡 Try your AI Chef</Text>
        <Text style={styles.tipText}>🥬 Veg: Paneer, onion, tomato, capsicum</Text>
        <Text style={styles.tipText}>🍗 Non-Veg: Chicken, yogurt, ginger, garlic</Text>
        <Text style={styles.tipText}>🥚 Non-Veg: Eggs, onion, tomato, chilli</Text>
      </View>
    </>
  );

  const renderMealPlan = () => (
    <>
      {header("Meal Planner", "Keep your meals organised.")}

      <View style={styles.planBanner}>
        <Text style={{ fontSize: 28 }}>📅</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.todayLabel}>TODAY</Text>
          <Text style={styles.todayName}>
            {today.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your planned meal</Text>

      {todayRecipe ? (
        <View style={styles.plannedRecipe}>
          <Text style={styles.plannedEmoji}>{todayRecipe.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.todayName}>{todayRecipe.name}</Text>
            <Text style={styles.recipeMeta}>
              {todayRecipe.category} · {todayRecipe.time} min
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedRecipe(todayRecipe)}>
            <Text style={styles.viewText}>View →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.emptyPlan}>
          <Text style={{ fontSize: 28 }}>🍽️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.todayName}>No meal planned yet</Text>
            <Text style={styles.muted}>Choose a recipe to add to today's plan.</Text>
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>Choose a recipe</Text>
      {RECIPES.slice(0, 8).map(recipeCard)}
    </>
  );

  const renderGroceries = () => (
    <>
      {header("Grocery List", "Everything you need in one place.")}

      <View style={styles.groceryInputRow}>
        <TextInput
          style={[styles.searchInput, { flex: 1, marginBottom: 0 }]}
          placeholder="Add grocery item..."
          placeholderTextColor="#9BA49A"
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={addGroceryItem}
        />
        <TouchableOpacity style={styles.addButton} onPress={addGroceryItem}>
          <Text style={styles.addButtonText}>＋</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grocerySummary}>
        <Text style={styles.grocerySummaryText}>
          {groceries.filter((item) => item.checked).length} of {groceries.length} completed
        </Text>
      </View>

      {groceries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.todayName}>Your grocery list is empty</Text>
          <Text style={styles.muted}>Add items or add ingredients from a recipe.</Text>
        </View>
      ) : (
        groceries.map((item) => (
          <View key={item.id} style={styles.groceryItem}>
            <TouchableOpacity
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
              onPress={() => toggleGrocery(item.id)}
            >
              <View
                style={[
                  styles.groceryCheckbox,
                  item.checked && styles.groceryCheckboxChecked,
                ]}
              >
                {item.checked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text
                style={[
                  styles.groceryName,
                  item.checked && styles.groceryNameChecked,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteGrocery(item.id)}>
              <Text style={styles.deleteText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </>
  );

  const renderSaved = () => {
    const savedRecipes = allRecipes.filter((recipe) => saved.includes(recipe.id));

    return (
      <>
        {header("Saved Recipes", "Your favourite meals, all in one place.")}

        {savedRecipes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>♡</Text>
            <Text style={styles.todayName}>No saved recipes yet</Text>
            <Text style={styles.muted}>Tap the heart on a recipe to save it here.</Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setTab("Recipes")}
            >
              <Text style={styles.primaryButtonText}>Explore recipes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          savedRecipes.map(recipeCard)
        )}
      </>
    );
  };

  const renderNutrition = () => {
    const nutrition = todayNutrition;

    return (
      <>
        {header("Nutrition Tracker", "Understand what goes into your body.")}

        <View style={styles.nutritionHero}>
          <Text style={styles.nutritionEyebrow}>TODAY'S NUTRITION</Text>
          <Text style={styles.calorieNumber}>
            {nutrition ? nutrition.calories : 0}
          </Text>
          <Text style={styles.calorieCaption}>kcal planned</Text>

          <View style={styles.calorieDivider} />

          <View style={styles.calorieBottom}>
            <View>
              <Text style={styles.nutritionSmallLabel}>DAILY GOAL</Text>
              <Text style={styles.nutritionSmallValue}>
                {DAILY_GOALS.calories} kcal
              </Text>
            </View>

            <View>
              <Text style={styles.nutritionSmallLabel}>REMAINING</Text>
              <Text style={styles.nutritionSmallValue}>
                {nutrition
                  ? Math.max(DAILY_GOALS.calories - nutrition.calories, 0)
                  : DAILY_GOALS.calories}{" "}
                kcal
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Macronutrient breakdown</Text>

        {!nutrition ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🥗</Text>
            <Text style={styles.todayName}>No nutrition data yet</Text>
            <Text style={styles.muted}>
              Plan a recipe with available nutrition information to see its estimated macros here.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setTab("Meal Plan")}
            >
              <Text style={styles.primaryButtonText}>Plan a meal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.macroCard}>
            <NutritionProgress
              label="Protein 💪"
              value={nutrition.protein}
              goal={DAILY_GOALS.protein}
              unit="g"
              color="#438A59"
            />
            <NutritionProgress
              label="Carbohydrates 🌾"
              value={nutrition.carbs}
              goal={DAILY_GOALS.carbs}
              unit="g"
              color="#D9A34D"
            />
            <NutritionProgress
              label="Fat 🥑"
              value={nutrition.fat}
              goal={DAILY_GOALS.fat}
              unit="g"
              color="#D17A65"
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>Today's planned meal</Text>

        {todayRecipe ? (
          <View style={styles.nutritionMealCard}>
            <View style={styles.nutritionMealIcon}>
              <Text style={{ fontSize: 35 }}>{todayRecipe.emoji || "🍽️"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.todayName}>{todayRecipe.name}</Text>
              <Text style={styles.recipeMeta}>
                {todayRecipe.category} · {todayRecipe.time || 25} min
              </Text>
              <Text style={styles.nutritionMealCalories}>
                {nutrition
                  ? `${nutrition.calories} kcal per serving`
                  : "Nutrition estimate unavailable"}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyPlan}>
            <Text style={{ fontSize: 28 }}>🍽️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.todayName}>No meal planned today</Text>
              <Text style={styles.muted}>
                Add a recipe to your meal plan to get started.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.nutritionTip}>
          <Text style={styles.tipTitle}>💡 Nutrition tip</Text>
          <Text style={styles.tipText}>
            Include protein-rich foods, vegetables, whole grains and healthy fats in your daily meals.
          </Text>
        </View>

        <Text style={styles.nutritionDisclaimer}>
          Nutrition values are approximate per-serving estimates, not measured intake. This dashboard
          currently reflects one planned recipe. Daily goals are example settings, not personalized
          dietary recommendations.
        </Text>
      </>
    );
  };

  const tabs = [
    { name: "Home", icon: "⌂" },
    { name: "Recipes", icon: "🍽️" },
    { name: "AI Chef", icon: "✨" },
    { name: "Meal Plan", icon: "▦" },
    { name: "Nutrition", icon: "📊" },
    { name: "Groceries", icon: "🛒" },
    { name: "Saved", icon: "♡" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#F7F8F3" barStyle="dark-content" />

      <View style={styles.appContainer}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {tab === "Home" && renderHome()}
          {tab === "Recipes" && renderRecipes()}
          {tab === "AI Chef" && renderAIChef()}
          {tab === "Meal Plan" && renderMealPlan()}
          {tab === "Nutrition" && renderNutrition()}
          {tab === "Groceries" && renderGroceries()}
          {tab === "Saved" && renderSaved()}
        </ScrollView>

        <View style={styles.bottomNav}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bottomNavContent}
          >
            {tabs.map((item) => (
              <TouchableOpacity
                key={item.name}
                style={[
                  styles.tabButton,
                  tab === item.name && styles.activeTabButton,
                ]}
                onPress={() => {
                  setTab(item.name);
                  setSelectedRecipe(null);
                }}
              >
                <Text style={styles.tabIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.tabText,
                    tab === item.name && styles.activeTabText,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {selectedRecipe && (
        <View style={styles.modalOverlay}>
          <View style={styles.recipeModal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalEmoji}>{selectedRecipe.emoji || "🍽️"}</Text>
                <TouchableOpacity onPress={() => setSelectedRecipe(null)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>{selectedRecipe.name}</Text>
              <Text style={styles.recipeMeta}>
                ⏱ {selectedRecipe.time || 25} min · 💪 {selectedRecipe.protein || 0}g protein
              </Text>

              <Text style={styles.sectionTitle}>Ingredients</Text>
              {selectedRecipe.ingredients.map((item, index) => (
                <Text key={index} style={styles.modalText}>• {item}</Text>
              ))}

              <Text style={styles.sectionTitle}>Preparation steps</Text>
              {selectedRecipe.steps.map((item, index) => (
                <View key={index} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.modalText, { flex: 1 }]}>{item}</Text>
                </View>
              ))}

              {NUTRITION_DATA[selectedRecipe.id] && (
                <>
                  <Text style={styles.sectionTitle}>Estimated nutrition per serving</Text>
                  <Text style={styles.modalText}>
                    🔥 {NUTRITION_DATA[selectedRecipe.id].calories} kcal
                  </Text>
                  <Text style={styles.modalText}>
                    💪 Protein: {NUTRITION_DATA[selectedRecipe.id].protein}g
                  </Text>
                  <Text style={styles.modalText}>
                    🌾 Carbs: {NUTRITION_DATA[selectedRecipe.id].carbs}g
                  </Text>
                  <Text style={styles.modalText}>
                    🥑 Fat: {NUTRITION_DATA[selectedRecipe.id].fat}g
                  </Text>
                </>
              )}

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  addToMealPlan(selectedRecipe);
                  setSelectedRecipe(null);
                }}
              >
                <Text style={styles.primaryButtonText}>＋ Add to today's meal plan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => addRecipeIngredients(selectedRecipe)}
              >
                <Text style={styles.secondaryButtonText}>🛒 Add ingredients to groceries</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => toggleSaved(selectedRecipe.id)}
              >
                <Text style={styles.secondaryButtonText}>
                  {saved.includes(selectedRecipe.id) ? "♥ Remove from saved" : "♡ Save recipe"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// --------------------------------------------------
// ROOT: SESSION RESTORE + LOGIN GATE
// --------------------------------------------------

export default function App() {
  const [booting, setBooting] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Restore the previous session when the app opens
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);

        if (!storedToken) return;

        try {
          // Ask the server whether the saved token is still valid
          const data = await apiRequest("/me", { token: storedToken, timeout: 8000 });
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
          setToken(storedToken);
          setUser(data.user);
        } catch (error) {
          if (error.status === 401) {
            // Token expired or invalid -> force a fresh login
            await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
          } else if (storedUser) {
            // Server unreachable -> keep the user signed in with cached details
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.log("Session restore failed:", error);
      } finally {
        setBooting(false);
      }
    };

    restoreSession();
  }, []);

  const handleAuthSuccess = useCallback(async (newToken, newUser) => {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, newToken],
      [USER_KEY, JSON.stringify(newUser)],
    ]);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch (error) {
      console.log("Logout storage error:", error);
    }
    setToken(null);
    setUser(null);
  }, []);

  if (booting) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <StatusBar backgroundColor="#F7F8F3" barStyle="dark-content" />
        <Text style={{ fontSize: 48 }}>🥑</Text>
        <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 18 }} />
      </SafeAreaView>
    );
  }

  if (!token || !user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <MealMindMain
      key={user.id}
      user={user}
      token={token}
      onLogout={handleLogout}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8F3",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  appContainer: {
    flex: 1,
    backgroundColor: "#F7F8F3",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  headerRight: {
    alignItems: "center",
  },
  logoutButton: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E9DF",
  },
  logoutButtonText: {
    color: "#C96F62",
    fontSize: 10,
    fontWeight: "900",
  },
  brand: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
  },
  pageTitle: {
    color: DARK,
    fontSize: 25,
    fontWeight: "900",
    marginTop: 7,
  },
  subtitle: {
    color: MUTED,
    fontSize: 12,
    marginTop: 5,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    backgroundColor: LIGHT_GREEN,
    justifyContent: "center",
    alignItems: "center",
  },
  hero: {
    backgroundColor: "#244832",
    padding: 24,
    borderRadius: 25,
    marginBottom: 20,
  },
  heroEyebrow: {
    color: "#C9D9C1",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 33,
    fontWeight: "900",
    lineHeight: 40,
    marginTop: 15,
  },
  heroDescription: {
    color: "#DCE9D8",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 12,
  },
  heroButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 13,
    paddingHorizontal: 17,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginTop: 20,
  },
  heroButtonText: {
    color: GREEN,
    fontWeight: "900",
    fontSize: 12,
  },
  quickStats: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECE3",
  },
  statNumber: {
    color: GREEN,
    fontSize: 20,
    fontWeight: "900",
  },
  statLabel: {
    color: MUTED,
    fontSize: 10,
    marginTop: 5,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: DARK,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 15,
    marginBottom: 13,
  },
  viewText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
  },
  recipeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8ECE3",
  },
  recipeImage: {
    height: 125,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  recipeEmoji: {
    fontSize: 55,
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 13,
    backgroundColor: "#FFFFFF",
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  heartText: {
    color: "#D56B6B",
    fontSize: 21,
    fontWeight: "900",
  },
  recipeInfo: {
    padding: 15,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  recipeName: {
    color: DARK,
    fontSize: 15,
    fontWeight: "900",
    flex: 1,
  },
  foodBadge: {
    fontSize: 9,
    fontWeight: "900",
  },
  vegBadge: {
    color: "#438A59",
  },
  nonVegBadge: {
    color: "#C56D50",
  },
  recipeMeta: {
    color: MUTED,
    fontSize: 11,
    marginTop: 8,
  },
  recipeBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 13,
  },
  categoryTag: {
    color: GREEN,
    backgroundColor: LIGHT_GREEN,
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  homeFeature: {
    backgroundColor: LIGHT_GREEN,
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  homeFeatureEmoji: {
    fontSize: 30,
  },
  todayName: {
    color: DARK,
    fontSize: 14,
    fontWeight: "900",
  },
  muted: {
    color: MUTED,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  smallGreenButton: {
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  smallGreenButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 11,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E9DF",
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 13,
    color: DARK,
    fontSize: 13,
    marginBottom: 15,
  },
  filterHeading: {
    color: DARK,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 9,
    marginTop: 6,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 13,
  },
  filterChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E9DF",
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  activeFilterChip: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  filterText: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "800",
  },
  activeFilterText: {
    color: "#FFFFFF",
  },
  proteinToggle: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E9DF",
    borderRadius: 12,
    padding: 13,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  proteinToggleActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  proteinToggleText: {
    color: DARK,
    fontSize: 11,
    fontWeight: "900",
  },
  resultsText: {
    color: MUTED,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 12,
  },
  aiCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    padding: 19,
    borderWidth: 1,
    borderColor: "#E8ECE3",
  },
  aiCardTitle: {
    color: DARK,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 7,
  },
  inputLabel: {
    color: GREEN,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 18,
    marginBottom: 9,
  },
  aiInput: {
    minHeight: 85,
    textAlignVertical: "top",
  },
  quickPromptRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  quickPrompt: {
    backgroundColor: LIGHT_GREEN,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 11,
  },
  quickPromptText: {
    color: GREEN,
    fontSize: 10,
    fontWeight: "800",
  },
  primaryButton: {
    backgroundColor: GREEN,
    paddingVertical: 15,
    borderRadius: 13,
    alignItems: "center",
    marginTop: 15,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  secondaryButton: {
    backgroundColor: LIGHT_GREEN,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryButtonText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
  },
  loadingBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 22,
    alignItems: "center",
    marginTop: 15,
  },
  aiLoading: {
    color: MUTED,
    fontSize: 12,
    marginTop: 12,
    textAlign: "center",
  },
  aiResult: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 18,
    marginTop: 17,
    borderWidth: 1,
    borderColor: "#E8ECE3",
  },
  aiResultTitle: {
    color: GREEN,
    fontWeight: "900",
    fontSize: 14,
    marginBottom: 13,
  },
  aiText: {
    color: DARK,
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 6,
  },
  tipBox: {
    backgroundColor: LIGHT_GREEN,
    padding: 17,
    borderRadius: 17,
    marginTop: 18,
  },
  tipTitle: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
  },
  tipText: {
    color: DARK,
    fontSize: 11,
    lineHeight: 19,
  },
  planBanner: {
    backgroundColor: LIGHT_GREEN,
    borderRadius: 18,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 15,
  },
  todayLabel: {
    color: GREEN,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 5,
  },
  plannedRecipe: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E8ECE3",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  plannedEmoji: {
    fontSize: 35,
  },
  emptyPlan: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E8ECE3",
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  groceryInputRow: {
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
  },
  addButton: {
    backgroundColor: GREEN,
    width: 48,
    height: 48,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "700",
  },
  grocerySummary: {
    backgroundColor: LIGHT_GREEN,
    padding: 13,
    borderRadius: 12,
    marginTop: 15,
    marginBottom: 12,
  },
  grocerySummaryText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
  },
  groceryItem: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
    borderWidth: 1,
    borderColor: "#E8ECE3",
  },
  groceryCheckbox: {
    width: 21,
    height: 21,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#A8B5A4",
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  groceryCheckboxChecked: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  groceryName: {
    color: DARK,
    fontSize: 12,
    fontWeight: "700",
  },
  groceryNameChecked: {
    color: "#A0AAA0",
    textDecorationLine: "line-through",
  },
  deleteText: {
    color: "#C96F62",
    fontSize: 15,
    fontWeight: "900",
    paddingHorizontal: 5,
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E8ECE3",
    padding: 25,
    alignItems: "center",
    marginTop: 10,
  },
  emptyEmoji: {
    fontSize: 42,
    marginBottom: 12,
  },
  bottomNav: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8ECE3",
    paddingVertical: 7,
  },
  bottomNavContent: {
    paddingHorizontal: 7,
    alignItems: "center",
  },
  tabButton: {
    minWidth: 65,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 7,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: LIGHT_GREEN,
  },
  tabIcon: {
    fontSize: 17,
    marginBottom: 3,
  },
  tabText: {
    color: MUTED,
    fontSize: 9,
    fontWeight: "700",
  },
  activeTabText: {
    color: GREEN,
    fontWeight: "900",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 16,
  },
  recipeModal: {
    backgroundColor: "#F7F8F3",
    borderRadius: 23,
    padding: 20,
    maxHeight: "88%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalEmoji: {
    fontSize: 45,
  },
  closeButton: {
    color: MUTED,
    fontSize: 22,
    fontWeight: "900",
    padding: 8,
  },
  modalTitle: {
    color: DARK,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 10,
  },
  modalText: {
    color: DARK,
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 9,
  },
  stepNumber: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
  },

  // AUTH SCREEN
  authContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "stretch",
    padding: 24,
  },
  authLogo: {
    width: 78,
    height: 78,
    borderRadius: 24,
    backgroundColor: LIGHT_GREEN,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  authTitle: {
    color: DARK,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 10,
  },
  authSubtitle: {
    color: MUTED,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 22,
  },
  authCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E8ECE3",
  },
  authInput: {
    backgroundColor: "#F7F8F3",
    borderWidth: 1,
    borderColor: "#E4E9DF",
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 13,
    color: DARK,
    fontSize: 13,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  showButton: {
    backgroundColor: LIGHT_GREEN,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
  },
  showButtonText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "900",
  },
  authSwitch: {
    color: MUTED,
    fontSize: 12,
    textAlign: "center",
    marginTop: 22,
  },

  // NUTRITION DASHBOARD
  nutritionHero: {
    backgroundColor: "#244832",
    borderRadius: 25,
    padding: 23,
    marginBottom: 20,
    elevation: 4,
  },
  nutritionEyebrow: {
    color: "#C9D9C1",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  calorieNumber: {
    color: "#FFFFFF",
    fontSize: 55,
    fontWeight: "900",
    marginTop: 12,
  },
  calorieCaption: {
    color: "#DCE9D8",
    fontSize: 14,
    fontWeight: "700",
  },
  calorieDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: 20,
  },
  calorieBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nutritionSmallLabel: {
    color: "#C9D9C1",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
  },
  nutritionSmallValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 6,
  },
  macroCard: {
    backgroundColor: "#FFFFFF",
    padding: 19,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#E8ECE3",
    marginBottom: 20,
  },
  nutritionProgress: {
    marginBottom: 22,
  },
  nutritionProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11,
  },
  nutritionLabel: {
    color: "#344638",
    fontSize: 13,
    fontWeight: "900",
  },
  nutritionValue: {
    color: "#7D887D",
    fontSize: 12,
    fontWeight: "800",
  },
  progressTrack: {
    height: 10,
    backgroundColor: "#EDF1EA",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
  nutritionMealCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#E8ECE3",
    marginBottom: 18,
  },
  nutritionMealIcon: {
    width: 65,
    height: 65,
    borderRadius: 17,
    backgroundColor: "#E9F0E4",
    justifyContent: "center",
    alignItems: "center",
  },
  nutritionMealCalories: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 7,
  },
  nutritionTip: {
    backgroundColor: "#E9F0E4",
    borderRadius: 19,
    padding: 18,
    marginTop: 10,
    marginBottom: 15,
  },
  nutritionDisclaimer: {
    color: "#929B90",
    fontSize: 10,
    lineHeight: 17,
    marginBottom: 20,
  },
});