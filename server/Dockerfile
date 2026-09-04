FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY server/ ./server/
COPY server/tsconfig.json ./tsconfig.json

RUN npm install typescript && npx tsc -p server/tsconfig.json

ENV PORT=3001
ENV JWT_SECRET=change-me-in-production

EXPOSE 3001

CMD ["node", "server/dist/index.js"]
