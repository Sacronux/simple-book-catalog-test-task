# Простой каталог книг

Стек технологий:

* Node.js
* TypeScript
* Nest.js
* Prisma.io
* MySQL or PostgresQL (на ваш выбор)
* GraphQL with code first approach

GraphQL схему для каталога смотри в файле schema.graphql.

Решение предоставить как ссылку на GitHub репозиторий.

В репозитории обязательно должен быть docker-compose.yml файл который:

* Дает доступ к node.js приложению через порт 5000.
* Дает доступ к mysql через порт 6000.
* Сохраняет mysql данные в volume ./mysql-data.

Приложение должно разворачиваться на локалке двумя командами:

```bash
npm install
docker-compose up
```

После docker-compose up в браузере по адресу http://localhost:5000/api/graphql должен быть доступен работоспособный GraphQL Playground.

После docker-compose down данные в базе не должны пропасть.

Приветствуются (но не обязательны) тесты, ограничение сложности GraphQL запросов (query complexity) и решение проблемы N+1 SQL запроса.
