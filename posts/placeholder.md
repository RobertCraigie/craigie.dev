---
title: Placeholder title
description: Placeholder description
slug: placeholder
date: Dec 1, 2021
---

Prisma schema file:

```prisma
datasource db {
  provider = "postgres"
  url      = env("DATABASE_URL")
}

generator client {
  provider             = "prisma-client-py"
  recursive_type_depth = -1
}

model User {
  id   String @id @default(cuid())
  name String
}
```

Python script:

```py
from prisma import Client

client = Client()
client.connect()

user = client.user.create(
    {
        'name': 'Robert',
    },
)

await client.connect()
```
