# IFCAT-IA
Immediate-Feedback Collaborative Assessment Tool is a collaborative quiz application for the classroom, based on [immediate feedback assessment technique](https://link.springer.com/article/10.1007/BF03395423).

## Quick Start

First make sure you read the configuration part, and have a `config.json` ready.

Then simply run `npm install && npm start` to start the server.

## Configuration

Application configuration is stored within `config.json`, and is in the following format:

* name: String - Application name, usually just use `ifcat`.
* baseDir: String - Application base directory, for example, if you want to host IFCAT under `domain.local/ifcat`, then base directory would be `/ifcat`.
* database: Object
    * url: String - Mongoose connection URL.
* session: Object
    * secret: String - Session secret, used to encrypt sessions.
* ia: Object
    * applicationId: String - Your application ID.
    * secretKey: String - Your application secret key.
    * root: String - Server root.
    * publicRoot: String - Optional. You can optionally set this, and set `root` as a LAN url, this will make 
* log: Object
    * path: String - Path to store logs.

## Want to Contribute?

Please head over to `CONTRIBUTING.md` for details.

> Built by students at the University of Toronto Scarborough with ❤️