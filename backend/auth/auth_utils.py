from passlib.context import CryptContext

# Set up CryptContext with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a cleartext password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a cleartext password against a hashed one."""
    return pwd_context.verify(plain_password, hashed_password)
