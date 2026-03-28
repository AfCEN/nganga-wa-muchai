FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Serve with lightweight static server
FROM node:20-slim

RUN npm install -g serve

COPY --from=build /app/dist /app/dist

ENV PORT=3000

CMD serve -s /app/dist -l $PORT
