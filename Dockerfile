FROM node:22-slim

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .
RUN pnpm build

CMD ["node", "dist/src/server.js"]
