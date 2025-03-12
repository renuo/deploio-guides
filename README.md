# Still to-do

- [ ] Add dropdowns for the documentation sections on the left - see mockup.

- [ ] Add search documentation field at the top of the sections to the left - Daniel on this

- [ ] Add translations (German only?)

- [X] Remove dark mode functionality and button

- [ ] Add 'Jetzt Starten' button. What is this? I guess to go to Cockpit sign up form?

- [ ] Check if we need login....? - Asked Vanessa but pretty sure we do not.

- [ ] Redo weird squares in React... I don't like how it's JSX in and md file.

- [X] Any way to add the current "area" e.g. "Ruby" or "Documentation" - maybe to top of sidebar

- [ ] Fill out **How Deploio Works**

- [ ] Add video link in **Getting Started**

- [ ] Fill out guides for **Code Repository Setups** (GitHub done)

- [ ] Fill out "Monitoring for health and performance" in **Database** section

- [ ] Fill out "Object Storage" and "Persistent Volumes" in **Other Dependencies** section

- [ ] Fill out **Networking & Deployment** section

- [ ] Add "Deployment Strategies" in **CI/CD Integration**

- [ ] Fill out **Troubleshooting** section

- [ ] Fill out **Monitoring and Logs** section

- [ ] Fill out **Security** section

- [ ] Tidy up **Migrating from Other Platforms** section

- [ ] Fill out **Our Stack** section

- [ ] Fill out **Tools** section

- [ ] Add "Pricing" page - is this just information or interactive?

# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.
