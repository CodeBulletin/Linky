import sqlite3
import datetime
from models import User, CreateUrlRequest

def insert_user(db: sqlite3.Connection, username: str, hash_password: str):
    if get_user(db, username) is not None:
        return "User already exists"
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO user (username, hash_password, last_password_change, last_complete_logout) VALUES (?, ?, ?, ?)",
        (username, hash_password, datetime.datetime.utcnow().timestamp(), datetime.datetime.utcnow().timestamp()),
    )
    db.commit()

def get_user(db: sqlite3.Connection, username: str):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM user WHERE username=?", (username,))

    # Send User object
    user = cursor.fetchone()
    if user is None:
        return None
    return User(username=user[0], hash_password=user[1], last_password_change=user[2], last_complete_logout=user[3])

def update_user(db: sqlite3.Connection, username: str, hash_password: str):
    cursor = db.cursor()
    cursor.execute(
        "UPDATE user SET hash_password=?, last_password_change=? WHERE username=?",
        (hash_password, datetime.datetime.utcnow().timestamp(), username),
    )
    db.commit()

def logout_user(db: sqlite3.Connection, username: str):
    cursor = db.cursor()
    cursor.execute(
        "UPDATE user SET last_complete_logout=? WHERE username=?",
        (datetime.datetime.utcnow().timestamp(), username),
    )
    db.commit()

def delete_user(db: sqlite3.Connection, username: str):
    cursor = db.cursor()
    cursor.execute("DELETE FROM user WHERE username=?", (username,))
    db.commit()

def check_url_id(db: sqlite3.Connection, urlID: str):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM url WHERE urlID=?", (urlID,))
    url = cursor.fetchone()
    if url is None:
        return False
    return True

def create_url(db: sqlite3.Connection, urlID: str, url: str, username: str):
    cursor = db.cursor()
    cursor.execute("INSERT INTO url (urlID, url, username, created_at) VALUES (?, ?, ?, ?)", (urlID, url, username, datetime.datetime.utcnow().timestamp()))
    db.commit()

def get_all_urls(db: sqlite3.Connection, username: str, page_no: int, items_per_page: int):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM url WHERE username=? ORDER BY created_at DESC LIMIT ? OFFSET ?", (username, items_per_page, (page_no - 1) * items_per_page))
    url_list = []
    for url in cursor.fetchall():
        url_list.append(CreateUrlRequest(urlID=url[0], url=url[1]))
    return url_list

def get_num_urls(db: sqlite3.Connection, username: str):
    cursor = db.cursor()
    cursor.execute("SELECT COUNT(*) FROM url WHERE username=?", (username,))
    num_urls = cursor.fetchone()[0]
    return num_urls

def update_url(db: sqlite3.Connection, urlID: str, url: str):
    cursor = db.cursor()
    cursor.execute("UPDATE url SET url=?, created_at=? WHERE urlID=?", (url, datetime.datetime.utcnow().timestamp(), urlID))
    db.commit()

def delete_url(db: sqlite3.Connection, urlID: str):
    cursor = db.cursor()
    cursor.execute("DELETE FROM url WHERE urlID=?", (urlID,))
    db.commit()

def get_url(db: sqlite3.Connection, urlID: str):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM url WHERE urlID=?", (urlID,))
    url = cursor.fetchone()
    if url is None:
        return None
    return CreateUrlRequest(urlID=url[0], url=url[1])

def delete_all_urls(db: sqlite3.Connection, username: str):
    cursor = db.cursor()
    cursor.execute("DELETE FROM url WHERE username=?", (username,))
    db.commit()

def check_url_id(db: sqlite3.Connection, urlID: str):
    cursor = db.cursor()
    cursor.execute("SELECT * FROM url WHERE urlID=?", (urlID,))
    url = cursor.fetchone()
    if url is None:
        return False
    return True