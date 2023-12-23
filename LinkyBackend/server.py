# Import FastAPI
from typing import Annotated
import sqlite3
from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware

import authentication
import urlshort
from database import get_db
from models import CreateUrlRequest
from dbhelper import get_url

with open("html/404.html", "r") as f:
    not_found = f.read()

with open("html/400.html", "r") as f:
    invalid = f.read()

app = FastAPI(exception_handlers={
    404: lambda request, exc: HTMLResponse(content=not_found, status_code=404),
    400: lambda request, exc: HTMLResponse(content=invalid, status_code=404)
})

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
        return HTMLResponse(content=invalid, status_code=404)
    url = get_url(db, url.urlID)
    if url is None:
        return HTMLResponse(content=not_found, status_code=404)
    
    return RedirectResponse(url=url.url, status_code=302)