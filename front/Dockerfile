FROM node:23-slim@sha256:8d56afd4d4f445a584eefd8d2415fc5e40a169ab92347c0a8a97c67b588ec707 AS builder
WORKDIR /app

ARG PORT=3009
ENV PORT=$PORT
ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN npm install --frozen-lockfile

COPY . .

RUN npm run build


FROM nginx:stable-alpine AS production
WORKDIR /usr/share/nginx/html


COPY --from=builder /app/dist ./

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

FROM node:23-slim@sha256:8d56afd4d4f445a584eefd8d2415fc5e40a169ab92347c0a8a97c67b588ec707 AS development
WORKDIR /app

ENV NODE_ENV=development

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3009

CMD ["npm", "run", "dev"]
