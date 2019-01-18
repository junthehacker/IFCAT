# IFCAT-IA
Immediate-Feedback Collaborative Assessment Tool is a collaborative quiz application for the classroom, based on [immediate feedback assessment technique](https://link.springer.com/article/10.1007/BF03395423).

> This version of IFCAT requires IA, if you wish to run IFCAT by itself, please consider using the old version available here: https://github.com/neeilan/IFCAT

## Transpiling front-end components
After changes in JSX files, the code needs to be transpiled. This is specifically for React-based front-end components in:
1. ```views/student/quiz``` - the student-side quiz is implemented using React.


Transpile front-end components by running ```webpack``` at the respective path (on node >=6.11.0).

## Configuration

Application configuration is stored within `config.json`, and is in the following format:

```json
{
    "production": { CONFIG_OBJECT },
    "development": { CONFIG_OBJECT }
}
```

CONFIG_OBJECT contains following properties:

#### name: String

Application name, usually just use `ifcat`.

#### baseDir: String

Application base directory, for example, if you want to host IFCAT under `domain.local/ifcat`, then base directory would be `/ifcat`.

#### database: Object

MongoDB configuration object

* `url`: Mongoose connection URL.

#### session: Object

Session configuration object

* `secret`: Session secret, used to encrypt sessions.

#### ia: Object

I.A. configuration object

* `applicationId`: Your application ID.
* `secretKey`: Your application secret key.
* `root`: Server root.
* `publicRoot`: Optional. You can optionally set this, and set `root` as a LAN url, this will make all API requests go through LAN. Can improve performance.

#### log: Object

Log configuration

* `path`: Path to store logs.

## Contribution

### Code Format

* Tab style: Always 4 spaces.
* Variable `=` sign vertical alignment: When grouped.
* `from` vertical alignment: Always.

### Code Heading

When adding a new file, or modifying a file, make sure you add/modify the heading

```javascript
/*------------------------------------
File description

Author(s): Your name [me at myname dot com]
-------------------------------------*/
```

### Promises / Callbacks

No promises or callbacks when possible, only `async / await`.

