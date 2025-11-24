# Use a lightweight Node.js base image
FROM node:20-alpine

# Use the non-root Node.js user provided by the image
USER node:node

# Set the working directory inside the container
WORKDIR /home/node/app

# Copy dependency manifests first to take advantage of Docker layer caching
COPY --chown=node:node package*.json ./

# Install all dependencies (including devDependencies required for building)
RUN npm install

# Copy the rest of the application files
COPY --chown=node:node . .

# Generate the Prisma client
RUN npx prisma generate

# Optionally seed the database during the build (usually done at runtime)
# RUN npm run prisma:seed

# Expose the application port (Fly.io will map external ports automatically)
EXPOSE 3000

# Run database migrations, then seed, then start the application
CMD ["sh", "-c", "npx prisma migrate deploy && npm run prisma:seed && npm run start"]
