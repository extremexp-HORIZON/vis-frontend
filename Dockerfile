# Use an Nginx image as base
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

# Copy built files from the Vite application into Nginx's web root directory
COPY dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 8080
EXPOSE 8080
