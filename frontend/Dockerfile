# Stage 1: build Angular app
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: serve with Nginx
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist/cap-ui/browser ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
