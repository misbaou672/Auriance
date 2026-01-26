"""Authentication routes with database"""
from fastapi import APIRouter, Depends, HTTPException, status, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas import UserCreate, UserResponse, Token, RegisterResponse, UserUpdate
from app.crud import create_user, get_user_by_username, authenticate_user
from app.services.auth_service import create_access_token
from datetime import timedelta
from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    full_name: str = Form(None),
    db: Session = Depends(get_db)
):
    """Register a new user and return access token with user data"""
    # Check if user already exists
    db_user = get_user_by_username(db, username=username)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Create user
    user_create = UserCreate(username=username, email=email, password=password, full_name=full_name)
    db_user = create_user(db, user_create)

    # Generate access token for the new user
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )

    return RegisterResponse(
        access_token=access_token,
        token_type="bearer",
        user=db_user
    )


@router.post("/login", response_model=Token)
async def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    print(f"[DEBUG] Tentative login: username={username}, password={password}")
    user = authenticate_user(db, username, password)
    print(f"[DEBUG] Utilisateur trouvé: {user}")
    if not user:
        print("[DEBUG] Échec d'authentification: mauvais identifiants ou utilisateur non trouvé")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    print(f"[DEBUG] Authentification OK pour {user.username}")
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Get current user"""
    return current_user

@router.patch("/me", response_model=UserResponse)
async def update_users_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    # Create dict with only set values
    update_data = user_update.dict(exclude_unset=True)
    
    # If using user_crud directly
    from app.crud.user_crud import update_user
    updated_user = update_user(db, current_user.id, update_data)
    
    return updated_user
