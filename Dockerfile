FROM node:20.15.1
WORKDIR /usr/src/absolutelyapricot.dev

COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run prestart

# Symlink our directories then copy the files
RUN ln -s /src/assets ./assets
RUN ln -s /src/config ./config
RUN mv /src/assets/* ./assets

EXPOSE 443
EXPOSE 80
CMD [ "npm", "start" ]