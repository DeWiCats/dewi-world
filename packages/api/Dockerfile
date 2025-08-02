FROM node:18-alpine

WORKDIR /app

# Install TypeScript globally
RUN npm install -g typescript

# Copy the entire repo (build context is root)
COPY . .

# Navigate to API package and install dependencies
WORKDIR /app/packages/api
RUN npm install --include=dev

# Create a standalone tsconfig for Docker build (in API directory)
RUN echo '{"compilerOptions":{"target":"ES2022","lib":["ES2022"],"module":"CommonJS","moduleResolution":"node","resolveJsonModule":true,"allowSyntheticDefaultImports":true,"esModuleInterop":true,"forceConsistentCasingInFileNames":true,"strict":true,"noImplicitAny":true,"strictNullChecks":true,"strictFunctionTypes":true,"noImplicitThis":true,"noImplicitReturns":true,"noUnusedLocals":false,"noUnusedParameters":true,"skipLibCheck":true,"sourceMap":true,"outDir":"./dist","noEmit":false,"emitDecoratorMetadata":true,"experimentalDecorators":true},"include":["./src/**/*.ts"],"exclude":["node_modules","dist"]}' > tsconfig.docker.json

# Build the application (clean dist first, then compile)
RUN rm -rf dist && tsc --project tsconfig.docker.json

# Remove dev dependencies for smaller production image
RUN npm prune --production

# Set environment variable for port
ENV FASTIFY_PORT=8080

# Expose port
EXPOSE 8080

# Start the application
CMD ["npm", "start"] 