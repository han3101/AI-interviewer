# Build the Next.js application
FROM node:20
WORKDIR /app
COPY ./package.json ./package-lock.json ./
RUN npm ci
COPY . ./
RUN npm run build

EXPOSE 3000

# Run the Next.js application
CMD ["npm", "start"]