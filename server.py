# Import FastAPI
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from starlette.responses import FileResponse, RedirectResponse
import validators
import hashlib
from dotenv import load_dotenv
import os

# Function to convert the string into a sha3_512 hash
def hash_string(string):
    return hashlib.sha3_512(string.encode()).hexdigest()

# Define the root endpoint
load_dotenv() 

site = os.getenv("LINKY_SITE_URL")
passwd = hash_string(os.getenv("LINKY_PASSWORD"))

templates = Jinja2Templates(directory="./template")

#Import sqlite3
import sqlite3

#Create a database connection
conn = sqlite3.connect('./url.db', check_same_thread=False)

#Create a cursor object
cursor = conn.cursor()

#Create a table
cursor.execute('''CREATE TABLE IF NOT EXISTS url
                (id TEXT PRIMARY KEY,
                url TEXT NOT NULL)''')

# Define a Pydantic model for the `item` object
class Url(BaseModel):
    url: str
    id: str
    password: str

class DeleteUrl(BaseModel):
    passwd: str
    pathid: str


# Function to generate a 7 charter string from lower case, uper case characters as well as digits
def generate_id():
    import random
    import string
    return ''.join(random.choices(string.ascii_lowercase + string.ascii_uppercase + string.digits, k=7))

# Function to check if the id is already in the database
def check_id(id):
    try:
        cursor.execute("SELECT * FROM url WHERE id=?", (id,))
        data = cursor.fetchone()
        if data is None:
            return True
        else:
            return False
    except:
        return None
    
# Function to check if the url is correct
def check_url(url):
    return validators.url(url)

# Function to validate the id
def validate_id(id):
    return id.isalnum()
        
# Create the app object
app = FastAPI()

# Define a root `/` endpoint
@app.get("/")
def index():
    return FileResponse('./static/index.html')

@app.get("/admin")
def listall():
    return FileResponse('./static/listall.html')

@app.get("/listall/{entries}")
def listall(entries):
    try:
        cursor.execute("SELECT Count(*) FROM url")
        data = cursor.fetchall()
        x = int(data[0][0]) // int(entries)
        if int(data[0][0]) % int(entries) == 0:
            return {"pages": x}
        else:
            return {"pages": x + 1}
    except Exception as e:
        print(e)
        return {"pages": 0}

@app.get("/listall/{entries}/{pageno}")
def listall(entries, pageno):
    try:
        cursor.execute("SELECT * FROM url LIMIT ? OFFSET ?", (int(entries), (int(pageno) - 1) * int(entries)))
        data = cursor.fetchall()
        return data
    except Exception as e:
        print(e)
        return {"error": "something went wrong"}


@app.get("/{id}")
def get(id):
    try:
        cursor.execute("SELECT * FROM url WHERE id=?", (id,))
        data = cursor.fetchone()
        if data is None:
            return FileResponse('./static/404.html')
        else:
            return RedirectResponse(data[1])
    except:
        return FileResponse('./static/404.html')
    
@app.get("/{id}/delete", response_class=HTMLResponse)
def delete(request: Request, id):
    if check_id(id):
        return FileResponse('./static/404.html')
    return templates.TemplateResponse("delete.html", {"request": request, "pathid": id})

@app.post("/add")
def add(url: Url):

    if hash_string(url.password) != passwd:
        return {"message": "password incorrect", "id": url.id, "type": "error"}

    if url.id == "":
        url.id = generate_id()
        while not check_id(url.id):
            url.id = generate_id()
    
    if not check_id(url.id):
        return {"message": "path already taken use something else", "id": url.id, "type": "error"}
    
    if not validate_id(url.id):
        return {"message": "path invalid please only use alphabets or numbers only", "id": url.id, "type": "error"}
    
    if not check_url(url.url):
        return {"message": "url not valid", "id": url.url, "type": "error"}
    
    try:
        # Insert a row of data
        cursor.execute("INSERT INTO url (id, url) VALUES (?, ?)", (url.id, url.url))
        # Save (commit) the changes
        conn.commit()
        return {"shortURL": f"{site + '/' + url.id}", "id": url.id, "type": "success"}
    except:
        return {"message": "something went wrong", "id": url.id, "type": "error"}


@app.post("/delete_url")
def delete_url(url: DeleteUrl):
    if hash_string(url.passwd) != passwd:
        return {"message": "password incorrect", "type": "error"}

    if check_id(url.pathid):
        return {"message": "path not found", "type": "error"}
    
    try:
        cursor.execute("DELETE FROM url WHERE id=?", (url.pathid,))
        conn.commit()
        return {"message": "deleted successfully", "type": "success"}
    except:
        return {"message": "something went wrong", "type": "error"}