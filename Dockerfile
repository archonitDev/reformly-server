# Use a lightweight Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and lock file first to leverage Docker cache
COPY package*.json yarn.lock ./

# Install dependencies (including devDependencies needed for build)
RUN npm install

# Copy the entire project
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Seed the database
RUN npm run prisma:seed

# Expose the application port (Fly.io maps this automatically)
EXPOSE 3000

# Run migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && npm run prisma:seed && npm run start"]
