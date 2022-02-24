---
title: Typing select queries in Python
description: Statically typing SQL select queries in Python
slug: typing-select
date: Feb 24, 2022
---

The recently accepted PEP 646 introduced variadic generics! While the main motivation for this feature was to improve typing for numerical libraries it also means that is now possible to accurately type the results of an SQL select query statement in Python!

There are some limitations to this however, unfortunately we cannot return named properties and instead must use a tuple form.

This post will walk through the process of typing and implementing the equivalent of an SQL select function, if you just want to see the final results then [click here](#final-implementation).

## Getting Started

This post assumes that you are already familiar with generics in python, if you are not then I suggest you read through this [tutorial](https://decorator-factory.github.io/typing-tips/tutorials/generics/).

You will also need a recent version of [typing-extensions](https://pypi.org/project/typing-extensions/) and [pyright](https://github.com/RobertCraigie/pyright-python).

### Introduction to PEP 646

The acceptance of [PEP 646](https://www.python.org/dev/peps/pep-0646/) means we can now create generics with an arbitrary number of type variables instead of being limited to a pre-defined number!

The new features that this introduces is `TypeVarTuple` and `Unpack` which must be used in combination with each other to represent variadic generics.

A not particularly useful example of this is inserting an integer to the start of a tuple (yes tuples are immutable but lets assume for this example that we would return a new tuple):

```py
{!sources/typing-select/pep-646.py!}
```

### Minimal example

The minimum code required to represent a select satement statically is actually fairly small.

```py
{!sources/typing-select/001.py!}
```

Now running this code through [pyright](https://github.com/microsoft/pyright) will give us the following output:

```
$ pyright typed_select.py
typed_select.py:20:13 - information: Type of "user" is "Tuple[int, str]"
```

Wow, this is exactly what we were looking for!

Now lets try actually running this code and see what happens:

```
$ python typed_select.py
Traceback (most recent call last):
  File "/Users/robert/code/craigie.dev/sources/typing-select/001.py", line 19, in <module>
    user = User.select(User.id, User.name)
AttributeError: type object 'User' has no attribute 'id'
```

Hmmmm that is annoying.

This is happening because we've given the `User` class type hints but haven't actually given these fields any values.

Let's assign some default values for the fields we are selecting:

```py highlight=9-10
{!sources/typing-select/002.py!}
```

We can now sucessfuly run this code:

```
$ python typed_select.py
Runtime type is 'NoneType'
```

## Implementation

Now let's implement the `select()` function so that we can actually use it at runtime.

Lets start by defining a `Field` class so that we don't have to assign weird defaults for each field and so we can store a reference to the field's name in the database.

```py
{!sources/typing-select/003.py! lines=8-12}
```

We now have to define a wrapper function over the `Field` class so that type checkers don't complain that we're assigning a `Field` instance when we can only assign strings for example.
This works as we tell the type checker that we are returning `Any` which disables type checking.

```py
{!sources/typing-select/003.py! lines=15-16}
```

Now lets update our `User` model to use the new `Field` class

```py
{!sources/typing-select/003.py! lines=35-39}
```

To make this easier to implement we'll define a list of records as our database instead of using a real database driver.

```py
{!sources/typing-select/003.py! lines=19-32}
```

Now all that we need to do is implement the select() function

```py
{!sources/typing-select/003.py! lines=41-56}
```

Let's type check it and make sure we haven't made any mistakes.

```
$ pyright typed_select.py
typed_select.py:60:13 - information: Type of "user" is "Tuple[str, int]"
```

All good! Now lets run it and see what we get!

```
$ python typed_select.py
Runtime type is 'tuple'
('Robert', 1)
```

Amazing! We've just managed to statically type and implement a select query!

There are some potential improvements that could be made to this, for example, returning a custom object that provides some helper methods instead of a raw tuple.

## Final Implementation

```py
{!sources/typing-select/003.py!}
```
