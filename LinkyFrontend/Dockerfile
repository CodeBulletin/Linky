# Use an alpine-based Nginx image
FROM nginx:1.25.3-alpine

# Set the working directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy the built SPA to the nginx serving directory
COPY . .

COPY ./default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the web server
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
