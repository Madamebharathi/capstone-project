FROM nginx:alpine

# Copy Angular build output from the browser subfolder
COPY dist/cap-ui/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]