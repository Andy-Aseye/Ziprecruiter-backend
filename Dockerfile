FROM node:18

COPY . /app
WORKDIR /app
RUN ls
RUN npm i
RUN npm run build
EXPOSE 8080

CMD [ "npm", "start" ]