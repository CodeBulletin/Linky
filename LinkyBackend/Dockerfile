# Dockerimage for the Linky url shortener

# Use the official Python image.
# https://hub.docker.com/_/python

FROM python:3.11-bullseye

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Update the packages
RUN apt-get update -y

# Install the required packages
RUN apt-get install curl build-essential gcc make -y

# Install any needed packages specified in requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable
ARG LINKY_SECRET_KEY
ARG LINKY_SITE_URL

# Run app.py when the container launches
CMD ["gunicorn", "-b", "0.0.0.0:8000", "-k", "uvicorn.workers.UvicornWorker", "server:app]"

# Build the image
# docker build -t linky .