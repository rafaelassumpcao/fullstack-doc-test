ARG NODE_VERSION=22
ARG PORT_ARG=4000

FROM node:${NODE_VERSION} as base

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=${PORT_ARG}


FROM base as deps
WORKDIR /app

ENV NODE_ENV=development
COPY package.json package-lock.json* ./

RUN npm ci


FROM base as builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
COPY tsconfig.json ./
COPY package.json .

RUN npm run build
RUN npm prune --production


FROM node:${NODE_VERSION}-alpine as production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=${PORT_ARG}

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json .

USER node

EXPOSE ${PORT}

CMD ["npm", "run", "start"]


FROM deps as development

WORKDIR /app

ENV NODE_ENV=development
ENV PORT=${PORT_ARG}

COPY --chown=node:node src ./src
COPY --chown=node:node tsconfig.json .

USER node

EXPOSE ${PORT}

CMD ["npm", "run", "dev"]
