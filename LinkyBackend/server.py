# Import FastAPI
from typing import Annotated
import sqlite3
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

import authentication
import urlshort
from database import get_db
from models import CreateUrlRequest
from dbhelper import get_url

app = FastAPI()

app.include_router(authentication.router)
app.include_router(urlshort.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "HEAD", "OPTIONS", "PUT", "PATCH", "DELETE"],
    allow_headers=["Access-Control-Allow-Headers", 'Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
)

@app.get("/{urlID}", responses={404: {"description": "Not found"}, 200: {"description": "OK"}})
def Show_Web_Page(urlID: str, db: Annotated[sqlite3.Connection, Depends(get_db)]):
    try:
        url = CreateUrlRequest(urlID=urlID, url="http://0.0.0.0")
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid URLID")
    url = get_url(db, url.urlID)
    if url is None:
        raise HTTPException(status_code=404, detail="URL not found")
    
    return RedirectResponse(url=url.url, status_code=302)