# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies that might be needed
# (e.g., for 'mysqlclient' if not using PyMySQL)
# RUN apt-get update && apt-get install -y gcc default-libmysqlclient-dev && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container
COPY ./requirements.txt /app/requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

# Copy the application code into the container
COPY ./app /app/app

# Command to run the application
# Use 0.0.0.0 to expose the port to other containers
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
