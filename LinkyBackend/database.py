import sqlite3
import os

def create_connection(db_file: os.path):
    """ create a database connection to a SQLite database """
    try:
        conn = sqlite3.connect(db_file, check_same_thread=False)
        return conn
    except sqlite3.Error as e:
        print(e)
 
    return None

def InitDB(db_file: os.path):
    try:
        conn = sqlite3.connect(db_file, check_same_thread=False)
    except sqlite3.Error as e:
        print(e)

    cursor = conn.cursor()

    # Create a user table with password and username
    cursor.execute('''CREATE TABLE IF NOT EXISTS user (
                    userName TEXT PRIMARY KEY,
                    hash_password TEXT NOT NULL,
                    last_password_change FLOAT,
                    last_complete_logout FLOAT)''')
    
    conn.commit()

    cursor.execute('''CREATE TABLE IF NOT EXISTS url (
                   urlID TEXT PRIMARY KEY,
                   url TEXT NOT NULL,
                   userName TEXT NOT NULL,
                   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                   FOREIGN KEY (userName) REFERENCES user(userName))''')
    
    # Create indexes for the user table
    cursor.execute('''CREATE INDEX IF NOT EXISTS user_name_index ON user(userName)''')

    # Create indexes for the url table
    cursor.execute('''CREATE INDEX IF NOT EXISTS url_id_index ON url(urlID)''')
    cursor.execute('''CREATE INDEX IF NOT EXISTS url_user_name_index ON url(userName)''')
    cursor.execute('''CREATE INDEX IF NOT EXISTS url_created_at_index ON url(created_at)''')

    # Create multicoloumn index for the url table
    cursor.execute('''CREATE INDEX IF NOT EXISTS url_user_name_created_at_index ON url(userName, created_at)''')
    
    conn.commit()
    return conn

def get_db():
    db = None
    try:
        if os.path.exists("linky.db"):
            db = create_connection("linky.db")
        else:
            db = InitDB("linky.db")
        yield db
    finally:
        db.close()