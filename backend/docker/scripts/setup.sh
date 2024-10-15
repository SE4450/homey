#!/bin/sh

# Install openssl
apk upgrade --update-cache --available && apk add openssl && rm -rf /var/cache/apk/*

# Generate a self-signed SSL certificate and key using the provided domain name
openssl req -x509 -newkey rsa:4096 -keyout /etc/ssl/private/key.pem -out /etc/ssl/certs/cert.pem -sha256 -days 365 -nodes -subj "/C=CA/ST=ON/L=London/O=Capstone/OU=Homey/CN=${SSL_COMMON_NAME}"

# Install npm libraries
npm install

