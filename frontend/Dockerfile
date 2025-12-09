FROM node:20-slim AS build

WORKDIR /app

# install dependencies using package lock for reproducible builds
COPY package*.json ./
RUN npm ci

# copy sources and build
COPY . ./
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]