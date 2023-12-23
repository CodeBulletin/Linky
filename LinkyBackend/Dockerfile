# Dockerimage for the Linky url shortener

# Use the official Python image.
# https://hub.docker.com/_/python

FROM python:3.11-alpine

# update and install dependencies
RUN apk update && apk add --no-cache --virtual gcc musl-dev cargo

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --upgrade pip

RUN pip install cython

RUN pip install -r requirements.txt

# Remove build dependencies
RUN apk del gcc musl-dev cargo

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable
ARG LINKY_SECRET_KEY
ARG LINKY_SITE_URL

# Run app.py when the container launches
CMD ["gunicorn", "-b", "0.0.0.0:8000", "-k", "uvicorn.workers.UvicornWorker", "server:app]"

# Build the image
# docker build -t linky .