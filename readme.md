## Необходимые действия для запуска проекта

1. установить node.js - [nodejs.org](https://nodejs.org/ "Node.JS")
2. установить mongodb - [MongoDBCompassCommunity](https://www.mongodb.com/download-center/compass "MongoDB Compass")
3. клонировать проект и перейти в каталог проекта
4. `npm i` или `yarn install` 
5. создать в корне проекта файл `.env`, настроить следующим образом:  
   
   ```dotnetcli
    PORT=3000               # порт приложения
    mode=production         # режим работы приложения ("development" работает с локальной БД)
    secretKey=secret        # секретный ключ для сессий

    JWT_SECRET='jwt_secret' # секретный ключ для работы с JWT-токенами

    DB_HOST='127.0.0.1'     # сервер локальной БД
    DB_PORT='27017'         # порт локальной БД

    REMOTE_DB_NAME='nameDB' # имя удаленной БД
    REMOTE_DB_USER='user'   # логин доступа к удаленной БД
    REMOTE_DB_PASS='pass'   # пароль к удаленной БД
   ```

6. запуск проекта командой `node app.js`