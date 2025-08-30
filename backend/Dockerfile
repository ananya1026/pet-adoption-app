FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy entire backend folder (source code + configs)
COPY . .

# Expose app port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
