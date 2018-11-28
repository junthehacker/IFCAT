# IFCAT-IA Developer Documentation

Welcome to IFCAT-IA developer documentation.

You can find a comprehensive JSDoc [here](https://junthehacker.github.io/IFCAT-IA/), please read it and make sure you understand the project structure before continuing.

## Overview

This project follows MVC design pattern, you must strictly follow it when contributing.

Most of the time namespace match directory structure, please keep this in mind when writing JSDocs. For example, `Controllers/Admin/FileController.js` will reside in `Controllers.AdminController`.

## Controllers

All route related logic should be in controllers, all controllers must extend from `Controller` class. You don't have to override any methods.

Controllers are singletons, keep this in mind when coding.

## Middlewares

Middlewares are classes, and must extend from `Middleware` class.

All middlewares must implement `async handler(req, res, next): Promise<void>` method.

## ParameterMiddlewares

Parameter middlewares are special middlewares, they are used to inject variables depending on URL arguments.

All parameter middlewares must extend from `ParameterMiddleware` class, and implement `async handler(req, res, next, id): Promise<void>` method.

## Providers

Providers provides services, they encapsulate data fetching/pushing logic from/to third-party services. Most of the times providers can just be their own class, with static methods.

## Style Conventions

### Folders/Files

* All folders should use `UpperCamelCase`.
* All class files should use `UpperCamelCase.js`.
* All function files should use `camelCase.js`.

### Namespaces

* All namespaces must use `UpperCamelCase`.

### Variables

* Always use `camelCase`.
* `var` is never allowed, use `let` or `const`.
* Groups variables assignment operator should be vertically aligned.

### JSDoc

* Always include JSDoc.

### Promises/Callbacks

Promises and callback syntax are **not** allowed (other than special instances like `asyncForEach`), you can promisify functions, but when using, should always do `async/await`.

```js
async function myFunc() {
    // This is BAD!
    Question.findOne({id: _id})
        .then(question => {
            // Do things here.
        });
    
    // This is WORSE!
    Question.findOne({id: _id}, function(err, question) {
        // Do things here.
    });
    
    // This is GOOD
    let question = await Question.findOne({id: _id});
    // Do things here.
}
```

### Iterators

Always use `[Symbol.iterator]` to create iterator interface.