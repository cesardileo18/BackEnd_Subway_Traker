FROM node 
ENV CLIENT_ID=d209016921d243b0bdf4f4abb2ce31a4 \
    CLIENT_SECRET=fcf5768d3e94462A8aA7807A93F73d10 \
    PORT=9050 \
    MONGO_URL=mongodb+srv://cesardileo18:VIIQEeSCtuUkdrAg@ecommerce.y5hlafe.mongodb.net/?retryWrites=true&w=majority

FROM ghcr.io/puppeteer/puppeteer:22.6.1

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 9050
CMD ["npm", "run", "start"]
