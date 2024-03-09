# Stage 1: Build the application for development
FROM node:latest as dev

# Set the working directory in the Docker container
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH


# Copy the package.json and package-lock.json (if available) to the container
COPY package*.json ./

# Install dependencies
RUN npm install


# Copy the rest of your application's source code from your host to your image filesystem.
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application in development mode
CMD ["npm", "start"]