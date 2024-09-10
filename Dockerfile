FROM node:20.12.1-slim
EXPOSE 4000

COPY package.json .
COPY tsconfig.json .
COPY src ./src

# COPY .env.development.local .env

RUN npm install

RUN npm run clean && npm run build && npm run copyfiles

CMD ["node", "dist/index.js"]