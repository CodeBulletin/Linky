import dotenv
import os

dotenv.load_dotenv()

SECRET_KEY = os.getenv("LINKY_SECRET_KEY")
URL = os.getenv("LINKY_SITE_URL")