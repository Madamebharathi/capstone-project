# Stage 1: build Angular app
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# Stage 2: serve with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy Angular build
COPY --from=build /app/dist/cap-ui/browser ./

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
