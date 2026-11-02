import os
import re
import sqlite3
from pathlib import Path
from functools import wraps

from flask import Flask, request, jsonify, g
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai

from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import generate_password_hash, check_password_hash


# --------------------------------------------------
# 1. CONFIGURATION
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")

DATABASE_PATH = BASE_DIR / "mealmind_users.db"

AUTH_SECRET_KEY = os.getenv("AUTH_SECRET_KEY")
if not AUTH_SECRET_KEY:
    raise ValueError("AUTH_SECRET_KEY missing in backend/.env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found. Please add it to backend/.env")

client = genai.Client(api_key=GEMINI_API_KEY)
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

app = Flask(__name__)
CORS(app)  # allows requests from the React Native app

token_serializer = URLSafeTimedSerializer(AUTH_SECRET_KEY, salt="mealmind-auth")
TOKEN_MAX_AGE = 30 * 24 * 60 * 60  # 30 days


# --------------------------------------------------
# 2. DATABASE + AUTH HELPERS
# --------------------------------------------------

def get_db():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with get_db() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        connection.commit()


initialize_database()


def create_token(user_id):
    return token_serializer.dumps({"user_id": user_id})


def get_current_user():
    header = request.headers.get("Authorization", "")

    if not header.startswith("Bearer "):
        return None

    token = header.split(" ", 1)[1].strip()

    try:
        payload = token_serializer.loads(token, max_age=TOKEN_MAX_AGE)
    except (BadSignature, SignatureExpired):
        return None

    connection = get_db()
    try:
        return connection.execute(
            "SELECT id, name, email FROM users WHERE id = ?",
            (payload["user_id"],)
        ).fetchone()
    finally:
        connection.close()


def login_required(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        user = get_current_user()

        if user is None:
            return jsonify({
                "success": False,
                "error": "Your session has expired. Please log in again."
            }), 401

        g.current_user = user
        return function(*args, **kwargs)

    return wrapper


def user_json(user):
    return {"id": user["id"], "name": user["name"], "email": user["email"]}


# --------------------------------------------------
# 3. HOME / HEALTH CHECK
# --------------------------------------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "success": True,
        "message": "Welcome to MealMind AI Backend!",
        "status": "Running",
        "model": MODEL_NAME
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "success": True,
        "status": "healthy",
        "application": "MealMind AI"
    })


# --------------------------------------------------
# 4. AUTHENTICATION
# --------------------------------------------------

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if len(name) < 2:
        return jsonify({"success": False, "error": "Please enter your full name."}), 400

    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return jsonify({"success": False, "error": "Enter a valid email address."}), 400

    if len(password) < 8:
        return jsonify({
            "success": False,
            "error": "Password must contain at least 8 characters."
        }), 400

    password_hash = generate_password_hash(password)

    try:
        with get_db() as connection:
            cursor = connection.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
                (name, email, password_hash)
            )
            connection.commit()
            user_id = cursor.lastrowid
    except sqlite3.IntegrityError:
        return jsonify({
            "success": False,
            "error": "Email already registered. Please log in."
        }), 409

    return jsonify({
        "success": True,
        "message": "Registration successful.",
        "token": create_token(user_id),
        "user": {"id": user_id, "name": name, "email": email}
    }), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    connection = get_db()
    try:
        user = connection.execute(
            "SELECT * FROM users WHERE email = ?", (email,)
        ).fetchone()
    finally:
        connection.close()

    if user is None or not check_password_hash(user["password_hash"], password):
        return jsonify({
            "success": False,
            "error": "Incorrect email or password."
        }), 401

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "token": create_token(user["id"]),
        "user": user_json(user)
    }), 200


@app.route("/me", methods=["GET"])
@login_required
def me():
    return jsonify({"success": True, "user": user_json(g.current_user)}), 200


# --------------------------------------------------
# 5. AI RECIPE GENERATION (login required)
# --------------------------------------------------

@app.route("/generate-recipe", methods=["POST"])
@login_required
def generate_recipe():
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"success": False, "error": "Invalid JSON request."}), 400

        ingredients = data.get("ingredients", "")
        preference = data.get("preference", "Any")

        if not isinstance(ingredients, str) or not ingredients.strip():
            return jsonify({"success": False, "error": "Please provide ingredients."}), 400

        ingredients = ingredients.strip()

        if len(ingredients) > 1000:
            return jsonify({
                "success": False,
                "error": "Please enter fewer ingredients."
            }), 400

        if preference not in ["Veg", "Non-Veg", "Any"]:
            preference = "Any"

        if preference == "Veg":
            food_instruction = """
            Create a strictly vegetarian Indian recipe.
            Do not include chicken, meat, fish, seafood or eggs.
            Dairy products are allowed.
            """
        elif preference == "Non-Veg":
            food_instruction = """
            Create a non-vegetarian Indian recipe.
            Use chicken, eggs, fish or seafood only when these
            ingredients are supplied by the user.
            If no non-vegetarian ingredient is supplied, clearly
            ask the user to add chicken, eggs, fish or seafood.
            Do not secretly classify a vegetarian recipe as non-vegetarian.
            """
        else:
            food_instruction = """
            Choose a suitable vegetarian or non-vegetarian recipe
            based on the ingredients supplied by the user.
            Do not introduce meat, fish or eggs unless the user
            has included a non-vegetarian ingredient.
            Clearly identify the food type.
            """

        prompt = f"""
You are MealMind AI, a helpful Indian cooking and meal-planning assistant.

USER INGREDIENTS:
{ingredients}

USER FOOD PREFERENCE:
{preference}

FOOD PREFERENCE RULES:
{food_instruction}

YOUR TASK:
Create one practical, delicious recipe using the supplied ingredients.

FORMAT YOUR RESPONSE USING THESE HEADINGS:

1. Recipe Name
Give the recipe a clear name.

2. Food Type
Mention Vegetarian or Non-Vegetarian.

3. Preparation Time
Give an estimated preparation and cooking time.

4. Ingredients
List the ingredients and approximate quantities.
Clearly identify any additional ingredients you recommend.

5. Cooking Instructions
Provide numbered, beginner-friendly cooking steps.

6. Cooking Tips
Give two or three useful cooking tips.

7. Nutrition Note
Do not invent exact nutritional values.
If you provide estimates, clearly label them as estimates.

IMPORTANT RULES:
- Prefer Indian recipes and familiar Indian cooking methods.
- Keep instructions simple and practical.
- Use the ingredients supplied by the user.
- Do not claim that a recipe is allergy-safe.
- Mention common allergens when relevant.
- For chicken, cook until the thickest part reaches
  an internal temperature of 74°C.
- Cook fish until it reaches 63°C or is opaque and flakes easily.
- Cook eggs until both yolk and white are firm.
- Never recommend eating raw or undercooked meat, fish or eggs.
- If the requested preference cannot be satisfied, explain why
  and ask for suitable ingredients.
- Do not add unrelated introductions or unnecessary conversation.
"""

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        recipe_text = response.text

        if not recipe_text:
            return jsonify({
                "success": False,
                "error": "Gemini returned an empty response. Please try again."
            }), 502

        return jsonify({
            "success": True,
            "recipe": recipe_text,
            "preference": preference
        }), 200

    except Exception as error:
        print("Recipe Generation Error:", str(error))
        return jsonify({
            "success": False,
            "error": "Unable to generate a recipe right now. Please try again."
        }), 500


# --------------------------------------------------
# 6. RUN APPLICATION
# --------------------------------------------------

if __name__ == "__main__":
    print("--------------------------------------")
    print("       MEALMIND AI BACKEND")
    print("--------------------------------------")
    print(f"Gemini Model: {MODEL_NAME}")
    print("Server: http://0.0.0.0:5000")
    print("--------------------------------------")

    # debug=True exposes an interactive debugger to your whole network.
    # Keep it off unless you set FLASK_DEBUG=1 for local development.
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=os.getenv("FLASK_DEBUG") == "1"
    )