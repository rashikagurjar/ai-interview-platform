from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from backend.auth.jwt_handler import verify_token
from backend.database.mongodb import users_collection

# OAuth2PasswordBearer reads the Authorization header to extract the token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Dependency that reads the Authorization header, validates the JWT, and returns the current user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Verify and decode JWT token
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    # Extract email (registered as 'sub' claim in JWT)
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    # Retrieve user document from MongoDB
    user = users_collection.find_one({"email": email})
    if user is None:
        raise credentials_exception
        
    return user
