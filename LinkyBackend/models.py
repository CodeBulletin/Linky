from pydantic import BaseModel, validator, Field
import datetime
import re

from urllib.parse import urlparse

# User Model with username starting with alphabet and rest of the characters can be alphanumeric with length between 4 and 20
class User(BaseModel):
    username: str = Field(min_length=4, max_length=20, pattern=r'^[A-Za-z][A-Za-z0-9]{3,19}$')

    hash_password: str
    last_password_change: float
    last_complete_logout: float

class Url(BaseModel):
    urlID: str or None = Field(min_length=0, max_length=20, pattern=r'^[A-Za-z0-9]{0,20}$')
    url: str
    username: str

    @validator('url')
    def url_validator(cls, url):
        parsed_url = urlparse(url)
        if parsed_url.scheme == "" or parsed_url.netloc == "":
            raise ValueError("Invalid URL")
        return url

class CreateUrlRequest(BaseModel):
    urlID: str or None = Field(min_length=0, max_length=20, pattern=r'^[A-Za-z0-9]{0,20}$')
    url: str

    @validator('url')
    def url_validator(cls, url):
        parsed_url = urlparse(url)
        if parsed_url.scheme == "" or parsed_url.netloc == "":
            raise ValueError("Invalid URL")
        return url

class CreateUserRequest(BaseModel):
    username: str = Field(min_length=4, max_length=20, pattern=r'^[A-Za-z][A-Za-z0-9]{3,19}$')
    password: str = Field(min_length=8, max_length=64, pattern=r'^[\x20-\x7E]{8,64}$')

class UpdatePasswordRequest(BaseModel):
    password: str = Field(min_length=8, max_length=64, pattern=r'^[\x20-\x7E]{8,64}$')
    last_password: str = Field(min_length=8, max_length=64, pattern=r'^[\x20-\x7E]{8,64}$')

class Token(BaseModel):
    access_token: str
    token_type: str