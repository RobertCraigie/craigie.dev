---
title: How to make a URL Shortener
description: Creating a URL shortener using Flask and Prisma Client Python
slug: flask-url-shortener
date: Dec 18, 2021
---

## Introduction

> If you want to skip to the end result you can find the full source code for this tutorial in the Prisma Client Python [repository](https://github.com/RobertCraigie/prisma-client-py/tree/main/examples/flask-url-shortener)

In this tutorial we are going to build a simple URL shortener using Flask and Prisma Client Python! Very similar to [bit.ly](https://bitly.com/).

What we will be using:

- [Flask](https://github.com/pallets/flask) is a lightweight micro framework for building web applications
- [Prisma Client Python](https://github.com/RobertCraigie/prisma-client-py) is a next-generation ORM built for type-safety
- [SQLite](https://sqlite.org/) is the database engine we will use, however you can easily adapt this example to use PostgreSQL, MySQL or one of the many other database engines that Prisma support!
- [Hashids](https://hashids.org/) is a small library that generates short and unique IDs from numbers.

## Prerequisites

- A Python 3 programming environment (using Python version 3.6 or higher)
- Familiarity with Python
- While it is not required, it is _highly_ recommeneded that you use an editor that supports autocompleting Prisma Client Python query arguments, a full list of supported editors can be found [here](https://github.com/RobertCraigie/prisma-client-py#auto-completion-for-query-arguments)

## Step 1 - Install dependencies

In this tutorial we'll be using the builtin [venv](https://docs.python.org/3/library/venv.html) module to manage our dependencies, however there are many other options for dependency management available, if you are familiar with another solution feel free to use that, the process should be mostly the same.

We need to create a virtual environment so that the dependencies for this project are not carried on to other projects which can cause bugs. You can create a virtual environment by running the following command in your terminal:

```
$ python3 -m venv .venv
```

We now need to activate the virtual environment we have just created, this is platform-dependent and you will have to re-activate the virtual environment every time you open a new terminal.
POSIX / Bash:

```
$ source .venv/bin/activate
```

Windows CMD:

```
$ .venv\Scripts\activate.bat
```

Windows PowerShell:

```
$ .venv\Scripts\Activate.ps1
```

Now that our virtual environment has been activated we can get on to actually installing the dependencies we need. Create a new file named **requirements.txt** and copy the following requirements into it:

```
flask==2.0.1
hashids==1.3.1
prisma==0.4.2
```

Let's install these requirements using [pip](https://pip.pypa.io/en/stable/), the package manager for python. Run the following command in your terminal:

```sh
$ pip install -r requirements.txt
```

## Step 2 - Setup Prisma Schema

Now that we've successfully installed [Prisma Client Python](https://github.com/RobertCraigie/prisma-client-py) we can write our Prisma Schema File and setup the database.

In Prisma Client Python you define the database connection in a **datasource** block in the Prisma Schema, here you must specify the database provider (in our case sqlite) and the url used to connect to the database (this can either be a hard coded string or a reference to an environment variable).

<!-- TODO: refactor -->

Create a new file called **schema.prisma**:

```prisma
{!./src_examples/prisma-flask-url-shortener/schema.prisma! lines=1-6}
```

Now that we've defined our database connection we must tell Prisma that we want to use [Prisma Client Python](https://github.com/RobertCraigie/prisma-client-py) as Prisma officially supports [TypeScript](https://prisma.io) and [Go](https://github.com/prisma/prisma-client-go).
We do this using a **generator** block:

```prisma
{!./src_examples/prisma-flask-url-shortener/schema.prisma! lines=8 9 11}
```

But as we're going to be using [Flask](https://github.com/pallets/flask) we need to tell Prisma Client Python to generate a synchronous client instead of the default asynchronous client. If you don't know what the difference is, don't worry about it TODO

```prisma highlight=3
{!./src_examples/prisma-flask-url-shortener/schema.prisma! lines=8-11}
```

Now we can get onto defining the only model we need for our URL Shortener, copy the following model definition into your **schema.prisma** file:

```prisma
{!./src_examples/prisma-flask-url-shortener/schema.prisma! lines=13-18}
```

The ID field will be automatically filled in by Prisma and we'll then pass this value to [hashids](https://hashids.org/) which will then give us a string like "3kTMd".

```prisma highlight=2
{!./src_examples/prisma-flask-url-shortener/schema.prisma! lines=13-18}
```

We're going to use this field on a stats page showing when the redirect URL was created

```prisma highlight=3
{!./src_examples/prisma-flask-url-shortener/schema.prisma! lines=13-18}
```

We'll use this field to store the _actual_ URL that we will be redirecting to

```prisma highlight=4
{!./src_examples/prisma-flask-url-shortener/schema.prisma! lines=13-18}
```

We're going to use this field for a stats page showing how many times a certain redirect URL has been clicked

```prisma highlight=5
{!./src_examples/prisma-flask-url-shortener/schema.prisma! lines=13-18}
```

### Checkpoint

Your **schema.prisma** file should now look like this:

```prisma
{!./src_examples/prisma-flask-url-shortener/schema.prisma!}
```

## Step 3 - Setup the database and the client

Now that we've defined our database connection, generator and datamodels we can sync our prisma schema to the database.
The easiest way to do this is using the `prisma db push` command which will also generate Prisma Client Python for us!

```
$ prisma db push
Prisma schema loaded from schema.prisma
Datasource "db": SQLite database "database.db" at "file:database.db"

SQLite database database.db created at file:database.db

🚀  Your database is now in sync with your schema. Done in 26ms

✔ Generated Prisma Client Python to ./.venv/lib/python3.9/site-packages/prisma in 265ms
```

## Step 4 - Creating the Flask app

> If you're using an IDE like VSCode then you may have to install **types-flask** for the optimal experience.

We're going to write our flask application in a single file called **app.py**.
Lets start off by defining a function to connect to the database using the Prisma Client, add the following lines to the **app.py** file

```py
{!./src_examples/prisma-flask-url-shortener/app.py! lines=1-14}
```

For ease of use we've included all the imports that we'll need later.

We store the Prisma Client Python instance using [Flask's application globals](https://flask.palletsprojects.com/en/2.0.x/api/#application-globals) as we need to be able to share the Client between requests so that we don't have to create new connections to the database on every new request which would be terribly inefficient.

```py highlight=3,5
{!./src_examples/prisma-flask-url-shortener/app.py! lines=8-14}
```

Next we need to define a function to close the connections to the database when our Flask app stops.
Add the following lines to the **app.py** file:

```py
{!./src_examples/prisma-flask-url-shortener/app.py! lines=17-21}
```

Now we will create our Flask app, register our **get_db()** function so that Prisma Client Python knows how to access the Client instance and create a **Hashids** instance so we can create short unique IDs.

<!-- TODO: explain these better -->

```py
{!./src_examples/prisma-flask-url-shortener/app.py! lines=23-28}
```

### Checkpoint

Your **app.py** file should now look like this:

```py
{!./src_examples/prisma-flask-url-shortener/app.py! lines=1-28}
```

## Step 5 - Creating the home page

We'll be using [Flask HTML templates](https://flask.palletsprojects.com/en/2.0.x/tutorial/templates/) alongside [Bootstrap](https://getbootstrap.com/) for styling. However we will not be delving very far into how this works, if you're unfamiliar with Bottstrap then you should read the [official documentation](https://getbootstrap.com/docs/5.1/getting-started/introduction/).

First, we need to create a base template that will load Bootstrap and setup our menu. Create a file at **templates/base.html** with the following content:

```html
{!./src_examples/prisma-flask-url-shortener/templates/base.html! lines=1-23 28-44}
```

Now lets create our landing page, create a file at **templates/index.html** with the following content:

```html
{!./src_examples/prisma-flask-url-shortener/templates/index.html!}
```

Now we need to create our first [Flask route](https://flask.palletsprojects.com/en/2.0.x/api/#url-route-registrations), this is what will tell Flask to send our **index.html** page to the user when they navigate to our website.

Add a new function to your **app.py** file like so:

```py
{!./src_examples/prisma-flask-url-shortener/app.py! lines=31-33}
```

This first line tells Flask to call the function when the user navigates the the home page of our website (represented with **/**) and when a **GET** request is received (this is what your browser sends to the web server when you load a page), if you're unfamiliar with HTTP methods, the [Mozilla documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) is a good source of information.

```py highlight=1
{!./src_examples/prisma-flask-url-shortener/app.py! lines=31-33}
```

Now lets run the Flask server and try out our website!
Run the following commands in your terminal:

```sh
$ export FLASK_APP=app
$ export FLASK_ENV=development
$ flask run
 * Serving Flask app 'app' (lazy loading)
 * Environment: development
 * Debug mode: on
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
 * Restarting with stat
 * Debugger is active!
 * Debugger PIN: 143-199-562
```

Navigate to http://127.0.0.1:5000/ in your browser and you should see a page like this:

![Screenshot of the URL Shortener home page](/flask-url-shortener/home.png)

Well done! You've now TODO
