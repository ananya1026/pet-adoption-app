FROM nginx:1.27-alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY public/ .

COPY nginx.conf /etc/nginx/conf.d/default.conf

HEALTHCHECK CMD curl -f http://localhost/index.html || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]