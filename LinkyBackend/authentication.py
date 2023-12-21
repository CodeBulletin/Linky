from datetime import datetime, timedelta
from typing import Annotated
import sqlite3
from fastapi import Depends, HTTPException, status, APIRouter, Response, Request
from jose import JWTError, jwt
from passlib.context import CryptContext
from envloader import SECRET_KEY
from models import CreateUserRequest, Token, User, UpdatePasswordRequest
from dbhelper import insert_user, get_user, update_user, logout_user, delete_user, delete_all_urls
from database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={
        400: {"description": "Bad Request"},
        404: {"description": "Not found"},
        401: {"description": "Unauthorized"},
        500: {"description": "Internal Server Error"},
        200: {"description": "OK"},
        201: {"description": "Created"},
    },
)

db_context = Annotated[sqlite3.Connection, Depends(get_db)]

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 2
bcrypt_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(db: sqlite3.Connection, username: str, password: str) -> User:
    user = get_user(db, username)
    if not user:
        return None
    if not bcrypt_context.verify(password, user.hash_password):
        return None
    return user

async def get_current_user(db: db_context, token: Annotated[Token, Depends(Token)]) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("user")
        created_at: int = payload.get("created_at")
        expiry: int = payload.get("exp")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    expiry = datetime.fromtimestamp(expiry)
    created_at = datetime.fromtimestamp(created_at)
    user = get_user(db, username)
    last_password_change = datetime.fromtimestamp(user.last_password_change)
    last_complete_logout = datetime.fromtimestamp(user.last_complete_logout)
    if user is None or expiry < datetime.utcnow() or created_at < last_password_change or created_at < last_complete_logout:
        raise HTTPException(status_code=404, detail="Invalid credentials")
    return user

async def validate_token(db, raw_token: str or None):
    if raw_token is None:
        raise HTTPException(status_code=404, detail="No Token Found")
    
    token = raw_token.split(' ')
    token= Token(access_token=token[1], token_type=token[0])
    
    try:
        user = await get_current_user(db, token.access_token)
    except HTTPException as e:
        raise e
    
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid username or password or user session expired")
    
    return user

def create_set_token(response: Response, user: CreateUserRequest):
    access_token_expires = timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)

    access_token = create_access_token(
        data={"user": user.username, "created_at": datetime.utcnow().timestamp()}, expires_delta=access_token_expires
    )

    response.set_cookie(key="jwt", value="bearer " + access_token, httponly=True, samesite="Lax", secure=True)

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def create_user(db: db_context, user: CreateUserRequest, response: Response):
    error = insert_user(db, user.username, bcrypt_context.hash(user.password))

    if error is not None:
        raise HTTPException(status_code=400, detail=error)
    
    create_set_token(response, user)

    return {"message": "User created successfully"}

@router.patch("/update_password")
async def update_password(db: db_context, request: Request, update_password_request: UpdatePasswordRequest):
    token = request.cookies.get("jwt")
    try:
        user = await validate_token(db, token)
    except HTTPException as e:
        raise e

    if not bcrypt_context.verify(update_password_request.last_password, user.hash_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    update_user(db, user.username, bcrypt_context.hash(update_password_request.password))
    return {"message": "Password updated successfully"}

@router.post("/logout_all")
async def logout_all(db: db_context, request: Request):
    token = request.cookies.get("jwt")
    try:
        user = await validate_token(db, token)
    except HTTPException as e:
        raise e
    
    logout_user(db, user.username)
    return {"message": "Logout successful"}

@router.get("/logout")
async def logout(db: db_context, response: Response, request: Request):
    token = request.cookies.get("jwt")
    try:
        await validate_token(db, token)
    except HTTPException as e:
        raise e
    
    response.delete_cookie(key="jwt")

    return {"message": "Logout successful"}

@router.post("/signin")
async def login(db: db_context, user: CreateUserRequest, response: Response):
    user = authenticate_user(db, user.username, user.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    create_set_token(response, user)

    return {"message": "User logged in successfully"}

@router.post('/delete_user')
async def delete_user(db: db_context, request: Request, user_data: CreateUserRequest):
    token = request.cookies.get("jwt")
    try:
        user = await validate_token(db, token)
    except HTTPException as e:
        raise e

    if user_data.username != user.username:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt_context.verify(user_data.password, user.hash_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    delete_all_urls(db, user.username)
    delete_user(db, user.username)
    
    return {"message": "User deleted successfully"}

@router.get("/user", response_model=User)
async def get_user_info(request: Request, db: db_context):
    token = request.cookies.get("jwt")
    try:
        user = await validate_token(db, token)
    except HTTPException as e:
        raise e

    return {"username": user.username, "last_password_change": user.last_password_change, "last_complete_logout": user.last_complete_logout, "hash_password": "NULL"}

@router.get("/")
async def is_alive(request: Request, db: db_context):
    token = request.cookies.get("jwt")
    try:
        user = await validate_token(db, token)
    except HTTPException as e:
        raise e
    
    return {"message": "User is alive"}