import random
import string
from typing import Annotated
import sqlite3

from fastapi import Depends, HTTPException, status, APIRouter, Request
from database import get_db
from models import CreateUrlRequest, User, Token
from authentication import get_current_user, validate_token
from dbhelper import create_url, get_all_urls, update_url, delete_url, check_url_id, get_num_urls

router = APIRouter(
    prefix="/url",
    tags=["url"],
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

@router.post("/new", status_code=status.HTTP_201_CREATED, response_model=CreateUrlRequest)
async def new_url(url: CreateUrlRequest, db: db_context, request: Request):
    token = request.cookies.get("jwt")

    try:
        user = await validate_token(db, token)
    except HTTPException as e:
        raise e
    
    if url.urlID == "":
        # generate a random urlID of length 8 with alphanumeric characters
        url.urlID = ''.join(random.choices(string.ascii_letters + string.digits, k=8))

        while check_url_id(db, url.urlID):
            url.urlID = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
            
    elif check_url_id(db, url.urlID):
        raise HTTPException(status_code=400, detail="URL Name already exists")

    create_url(db, url.urlID, url.url, user.username)
    return CreateUrlRequest(urlID=url.urlID, url=url.url)

@router.get("/all", status_code=status.HTTP_200_OK, response_model=list[CreateUrlRequest])
async def get_urls(db: db_context, page_no: int, items_per_page: int, request: Request):
    token = request.cookies.get("jwt")

    try:
        user = await validate_token(db, token)
    except HTTPException as e:
        raise e

    if page_no < 1:
        raise HTTPException(status_code=400, detail="Page number must be greater than 0")
    if items_per_page < 1:
        raise HTTPException(status_code=400, detail="Items per page must be greater than 0")
    
    urls = get_all_urls(db, user.username, page_no, items_per_page)
    return urls

@router.get("/count", status_code=status.HTTP_200_OK, response_model=int)
async def get_urls(db: db_context, request: Request):
    token = request.cookies.get("jwt")

    try:
        user = await validate_token(db, token)
    except HTTPException as e:
        raise e
    
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    num_urls = get_num_urls(db, user.username)
    return num_urls

@router.patch("/patch/", status_code=status.HTTP_200_OK)
async def update_url_data(url: CreateUrlRequest, db: db_context, request: Request):
    token = request.cookies.get("jwt")

    try:
        await validate_token(db, token)
    except HTTPException as e:
        raise e

    update_url(db, url.urlID, url.url)
    return CreateUrlRequest(urlID=url.urlID, url=url.url)

@router.delete("/delete/{urlID}", status_code=status.HTTP_200_OK)
async def remove_url(urlID: str, db: db_context, request: Request):
    token = request.cookies.get("jwt")

    try:
        await validate_token(db, token)
    except HTTPException as e:
        raise e

    try:
        url = CreateUrlRequest(urlID=urlID, url="http://0.0.0.0")
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid URLID")
    
    if not check_url_id(db, url.urlID):
        raise HTTPException(status_code=404, detail="URL not found")
    
    delete_url(db, url.urlID)
    return {"message": "URL deleted successfully"}