# Base image
FROM node:lts-alpine3.12

# Install other dependencies
RUN apk update && apk upgrade busybox

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Creates a "dist" folder with the production build
RUN npm run build

# Expose the data flow through port
EXPOSE 5001

# Start the server using the production build
CMD [ "node", "dist/main.js" ]
