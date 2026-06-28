from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

MONGO_URI = os.getenv("MONGO_URI")



client = MongoClient(MONGO_URI)

db = client["aeroassess"]

sessions_collection = db["sessions"]
users_collection = db["users"]

print("MongoDB Connected")