from fastapi import APIRouter, HTTPException, status
from backend.schemas import SignupRequest, LoginRequest, TokenResponse
from backend.auth.auth_utils import hash_password, verify_password
from backend.auth.jwt_handler import create_access_token
from backend.database.mongodb import users_collection

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", status_code=status.HTTP_201_CREATED)
def signup(req: SignupRequest):
    """Register a new user in the platform."""
    # Check if a user with this email already exists
    existing_user = users_collection.find_one({"email": req.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash the password using bcrypt
    hashed = hash_password(req.password)
    
    # Store the user in MongoDB (excluding plaintext password)
    new_user = {
        "name": req.name,
        "email": req.email,
        "hashed_password": hashed
    }
    users_collection.insert_one(new_user)
    
    return {"message": "Signup successful"}

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    """Authenticate a user and return a JWT access token."""
    # Fetch user by email
    user = users_collection.find_one({"email": req.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify the password using bcrypt
    if not verify_password(req.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Generate the JWT access token with the user email as subject ('sub')
    access_token = create_access_token(data={"sub": user["email"]})
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer"
    )
