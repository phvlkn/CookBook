FROM node:20-slim AS build

WORKDIR /app

# install dependencies using package lock for reproducible builds
COPY package*.json ./
# Install system build tools so native modules (esbuild) can be compiled
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 build-essential make g++ \
	&& rm -rf /var/lib/apt/lists/*
# Force native modules to be built from source inside the image
# Force building from package.json (ignore lockfile) so pinned esbuild version is installed
ENV npm_config_build_from_source=true
RUN npm install --no-audit --no-fund
# Ensure esbuild is rebuilt from source as a fallback
RUN npm rebuild esbuild --build-from-source || true

# copy sources and build
COPY . ./
# ensure build tools in node_modules/.bin are executable
RUN chmod +x ./node_modules/.bin/vite || true
RUN echo "=== esbuild debug info ===" \
	&& node -e "try{console.log('esbuild.version=', require('esbuild').version);}catch(e){console.error('esbuild.require failed', e.message); process.exit(0);}" \
	|| true
RUN ls -la node_modules/esbuild || true
RUN ls -la node_modules/esbuild/bin || true
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]