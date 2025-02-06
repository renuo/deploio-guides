---
title: A Guide for Migrating a Rails Application from Heroku to Deploio
description: Learn how to migrate an app from Heroku to Deploio
---

# A Guide for Migrating a Ruby on Rails Application from Heroku to Deploio

In this guide, we will be migrating the application called **gifcoins** using only the `nctl` command line tool. This guide could also be used to set up an application using the Cockpit user interface. See an overview of the tools available <a href="/documentation/tools" target="_blank">here</a>.

Our application will actually be named `main` as we will have multiple environments to setup. The environments will be set up as applications within the project `gifcoins`. The application created will be automatically namespaced within the project, so it is sufficient to only name it by the environment.

For more information on these terms and the structure, read the documentation <a href="/documentation/how_deploio_works" target="_blank">here</a>.

This example uses the tools listed below, and can be slightly adapted should you use something different. You can use the general documentation for details on other configurations.

- Currently deployed on **Heroku** which will be used to retrieve current configuration details
- **PostgresQL** database (PG15)
- **Redis** server
- **GitHub** for the code repository
- **1Password** for creating SSH keys
- **Semaphore** for the CI

## Preparation

### Application Size and Setup

#### Resources

We first want to decide on the level of resources (RAM and CPU) for our application. If you have an existing app running and are migrating to Deploio, you can check the sizes there and compare against the plans available [here](https://docs.nine.ch/docs/deplo-io/sizing-overview). For example on Heroku, you could run `heroku ps:type -a gifcoins-main`.

In our case, we are using a **Basic** Heroku plan, and will therefore go with the **mini** option (as both have 512MB of RAM).

[//]: # (TODO: unsure where we want to add information about sizing etc... was thinking with the database in "Dependencies and Add-ons" but not so sure. Maybe "Getting Started" should have a section about sizes and prices?)

#### Redis

You should also decide if you require workers and consider any additional services that your application will need. For example, if you have a Redis worker on a Heroku application, we can run `heroku redis:info -a gifcoins-main` to check the current Redis plan and setup. You can then compare this to the options available [here](https://docs.nine.ch/docs/on-demand-databases/on-demand-key-value-store#pricing).

For our application, the smallest instance **nine-key-value-store-1gb** is more than enough with 1GB RAM and 2GB of storage.

#### Database

We should also decide on the size of the database, and the version to use. We will setup a PostgresQL database, and again we will use the current database on Heroku as a guide. To check this we can run `heroku pg:info -a gifcoins-main` and we see that we are using the **essential-0** plan, with 20 connections, 1GB of data and using PG 15.8.

We can view the available machine types and PostgresQL versions available [here](https://docs.nine.ch/docs/on-demand-databases/on-demand-key-value-store#pricing).

In our application, we will choose the **nine-db-s** plan as this is recommended for production.

#### Checklist

Now you should have decided the following:

✅ Resource size for the application\
✅ Worker size (if required)\
✅ Database version\
✅ Database size

We will need this later for when we create the application.

### Environment Variables

To use many of the services on the application, you will need to set up the environment variables. This can be done manually with more control, deciding whether the environment variables is required at build or runtime, or alternatively a shell script could be used to retrieve all the environment variables if the application is already running elsewhere.

You can see an example of such a script <a href="/documentation/migrating_from_other_platforms" target="_blank">here</a> which is for retrieving the environment variables from Heroku and setting all variables as both build and runtime variables for the application.

You should decide on a preferred approach, and be aware of which environment variables required for setting up the project and deploying the application on Deploio.

## Authorise nctl

You will need to ensure that you are authorised and logged in to the `nctl` command line interface, and have access to the organization where you want to create the project and application. To check this you can run:

```
nctl auth whoami
```

You can see more information about setting up the `nctl` command line [here](documentation/#installing-nctl).

## Create Project

Firstly, we need to create the project. This is the outer level where we can group resources, set project level configuration and have an overview of the applications running for the project. A project can have many applications (and/or environments) if this is how you wish your project to be set up.

The project needs to be prefixed with the organisation you are currently working within, but we will also add a `display-name` option. This means it will display this name (without the prefix) in the Cockpit.

In our example, we are in the `renuo` organization and creating the project `gifcoins`, so we need to run the following:

```
nctl create project renuo-gifcoins \
  --display-name='gifcoins'
```

Once this is created, we can now set the project so that all of our future commands are within this project space.

```
nctl auth set-project gifcoins
```

[//]: # (TODO: where should we put information about creating projects and applications? "How Deploio Works" maybe?)

## Create Application

### Environment Variables

[As noted at the beginning](#environment-variables), we will need to set up the environment variables. We can manually set these or retrieve these from the existing platform provider. However this is done, we will require the variables in the format of `key1=value1;key2=value2;...` so that we can use the `--env` flag when creating the application:

```
nctl update application main \
  --env 'ADMIN_EMAIL=admin@damin.ch;ADMIN_PASSWORD=password'
```

### Setup Access to GitHub Repository

Before we actually create the application, we first need to set up access to the code repository.

First, we need to create an SSH key, We will do this using 1Password, but this can be done in any way you prefer. We will need to add the **public key to the GitHub repository** and pass the **private key to the application** when we create the application. Note that this SSH key can then be used for any application created that requires access to the repository. For example if you want to create multiple applications within the project, these can all use the same key.

To create the SSH key we can run the following:

```
op item create --title gifcoins-deploy-ssh-key \
  --vault Deploio \
  --category ssh-key \
  --ssh-generate-key Ed25519
```

In the response, we get the public key, and to view the private key we can run:

```
op item get {ID} --reveal
```

Should you wish to set this on GitHub manually, you need to go to the repository settings, “Deploy keys”  and “Add deploy key”. You can then give it a title, and paste the public key in the “Key” field.

Otherwise, we can push this directly to the GitHub repository deploy keys by running:

[//]: # (TODO: I'm not sure about this - I changed after Lukas commented but I think it's messed up. Check commands)

```
gh repo deploy-key add \
  --repo renuo/gifcoins \
  --title deploio_deploy_key_main \
  <(op item get {ID} --fields public_key)
```

We now will need to provide our application with the private key. However, we will need to first store this to a local file, and use the `--git-ssh-private-key-from-file` flag to set this directly from the file when creating our application.

First we need to store this to a temporary file:

```
op item get {ID} --fields private_key --reveal | tr -d '"' > temporary_private_key_file
```

Unfortunately this will contain quotation marks around the private key. These will need to be removed before passing the file to `nctl`. We need to do this manually.

We will use the private key that we have stored in the next step when creating the application.

Please note, should you use a different tool for storing your code, you can set up the access to the repository in a similar way. For more details see <a href="/documentation/code_repository_setup" target="_blank">here</a>.

### Create the Application

Now that we have the following available to us...

✅ The required resources and sizes for the application\
✅ The project created for the application\
✅ Environment variables in the correct format to be passed with the `--env` flag\
✅ A private SSH key stored locally, with the public key already setup on the GitHub repository

...we can create our application. We do this by running the `nctl create app` command with a number of flags. An example can be found below with explanations on the additional flags, however it is recommended to read through the available configuration [here](https://docs.nine.ch/docs/category/configuration).

[//]: # (TODO: can probably update the above link to `documentation/configuring_your_application` eventually?)
[//]: # (TODO: can probably update the above link to `documentation/configuring_your_application` eventually?)

```
nctl create app main \
  --project renuo-gifcoins \
  --git-ssh-private-key-from-file=temporary_private_key_file \
  --git-url git@github.com:renuo/gifcoins.git \
  --git-revision="main" \
  --size=mini \
  --basic-auth=false \
  --build-env=BP_INCLUDE_NODEJS_RUNTIME="true" \
  --env='ADMIN_EMAIL=admin@damin.ch.ch;ADMIN_PASSWORD=password'
```

- `--git-ssh-private-key-from-file` sets the private key from a file, rather than passing this as a string. We pass the private key we saved earlier.
- `--git-revision` sets the target revision for the application, in this case we want to deploy the **main** branch.
- `--size` sets the resources available for the application. This defaults to “micro” but we want to use “mini” which closely matches the Heroku Dyno as covered in the first step.
- `--basic-auth=false` disables the built in Deploio basic auth. We have set this because we already have basic auth “manually” set up on the project, however we would recommend utilising the built in basic auth if possible.
- `--build-env=BP_INCLUDE_NODEJS_RUNTIME="true"` ensures Node is available at build time for applications using JavaScript. Additionally, a `package.json` file also needs to be present at the root.

Note that we do not set the language as this allows the buildpack to be automatically detected. You can read more about buildpacks <a href="/documentation/security" target="_blank">here</a>.

Now, this will most likely fail. This is because we haven’t set the build environment variables. Unless you know exactly which variables are required at build time, we recommend that you add these one at a time and watch for the errors using:

```
nctl logs application main --follow
```

As an example, we see that we require the `FONTAWESOME_NPM_AUTH_TOKEN` during the build process. Therefore we can just update the application and add this to the build environment variables (note the slightly different syntax):

```
nctl update application main --build-env=FONTAWESOME_NPM_AUTH_TOKEN="token"
```

Because this is a build environment variable, the re-build will automatically be triggered.

Once the app is stable, we can migrate the database. This will be covered in the next section.

## Create and Migrate Database

To migrate the database from Heroku to Deploio, you will need to do the following:

✅ Set up the Deploio database server with SSH access, and allow access from your IP address.\
✅ Capture and download a backup from the Heroku application database.\
✅ “Restore” this backup to the Deploio database.

### Setup Database Access

First, we will need to create an SSH key which will be used to protect access to the database. We will do this using 1Password, but this can be done in any way you prefer.

```
op item create --title gifcoins-main-postgres-ssh-key \
  --vault Deploio \
  --category ssh-key \
  --ssh-generate-key ed25519
```

We can take the public key from the response, and add this to the allowed SSH keys when creating the database. You will also need to retrieve your IP address and add this to the allowed CIDRs.

### Create the Database

Now we have the IP address and public key, we can run the command to create the database server. There are a number of options that you need to consider. For example,  the daily backup retention defaults to 10, which we will leave unchanged. The full list of options can be found <a href="/documentation/dependencies_and_addons" target="_blank">here</a>.

We will be working with a PostgreSQL database.

```
nctl create postgres main \
  --postgres-version=15 \
  --machine-type=nine-db-s \
  --allowed-cidrs={IP_ADDRESS}/32 \
  --ssh-keys="$(op item get {ID} --fields public_key)"
```

Now that the database server has been created, we can access the server using the FQDN, generated user and password, and we can create the database.

We can find this information as follows:

- **FQDN**: Run
  ```sh
  nctl get postgres main
  ```
- **User**: The default user is `dbadmin`, but you can verify with
  ```sh
  nctl get postgres main --print-user
  ```
- **Password**: Retrieve it using
  ```sh
  nctl get postgres main --print-password
  ```

Now, we want to create the database on the server. We can use the `createdb` command to do so:

```
createdb -U dbadmin \
-h {FQDN} main
```

You will be prompted to enter the password.

We can check that this database was created by entering the server using `psql -U dbadmin -h {FQDN} -d postgres` and then running the command `\l` to list the databases on the server.

### Capture the database from Heroku

Now that we have our database setup and running, we can capture and download the existing databases from Heroku, and then “restore” this to the database we just created.

To capture and download locally we can run:

```
heroku pg:backups:capture -a main
heroku pg:backups:download -a main
```

This will create a `latest.dump` file locally on your machine in your current directory.

Now we can use `pg_restore` with the credentials for the database, and use this dump file to restore the database from Heroku. To do this we will run:

```
pg_restore \
-U {user} \
-h {FQDN} \
-d main \
-c -v latest.dump --no-owner --no-acl
```

We pass;

- The **user** we created earlier (typically `dbadmin`)
- The **FQDN** for the Deploio database server
- The database **name** that we set up earlier
- `-c` to clean the database first
- The `latest.dump` file which is to be restored
- `--no-owner` so the objects are owned by the user passed
- `--no-acl` to not restore the access control lists

Again, you will be prompted for the server password.

Finally, now this is all set up, we need to update the `DATABASE_URL` in the environment variables. For this, you will need the database url.

This can be retrieved by running the following command:

```
nctl get postgres main --print-connection-string
```

And then can be set as follows:

```
nctl update app main \
--language="ruby" \
--env="DATABASE_URL=postgres://username:password@fqdn:5432/name"
```

## Create Key Value Store

For our application, we need to set up **Redis** as the key value store.

Firstly, we create the key value store by running the `create kvs` command:

```
nctl create kvs main
```

This creates the Redis instance with name `main` within the project space. We now need to retrieve the information for this created instance, and set the environment variables using this information.

Firstly, we can get the **FQDN**, and check the other details, by running:

```
nctl get keyvaluestore main
```

We will also need to get the **password** for the access by running:

```
nctl get keyvaluestore main --print-token
```

From this we can construct and set the `REDIS_URL` and `REDISCLI_AUTH` environment variable as follows:

```
nctl update application main --env='REDIS_URL=rediss://:{PASSWORD}@{FQDN};REDISCLI_AUTH={PASSWORD}'
```

Note that we are using `rediss` as TLS is enabled.

## Set Up Jobs

For our application, we use **Sidekiq** for the background jobs.

To implement this, we need to create a `.deploio.yml` file in the project root directory. This specifies the worker name, the command to start the worker and the dyno size (this is set to micro by default). See more information <a href="/documentation/configuring_your_application" target="_blank">here</a>.

For our example, we add the following to the file:

```
workerJobs:
- name: sidekiq
  command: "bundle exec sidekiq"
  size: mini
```

You can also call this directly by:

```
nctl update application develop  \
  --worker-job-command="bundle exec sidekiq -C config/sidekiq.yml" \
  --worker-job-name "sidekiq" \ 
  --worker-job-size mini
```

## Configure CI

For our application we host the CI infrastructure on [**Semaphore**](https://semaphoreci.com). We therefore need to allow Semaphore to have access to the application, and also amend our deployment process and commands.

Firstly, we need to use the **API Service Account (ASA)** to create a token. This token can then be used in the deploy script, the allow the CI to authenticate with `nctl`.

In our example we will run:

```
nctl create asa gifcoins
```

We can then view the token using:

```
nctl get apiserviceaccount gifcoins --print-token
```

Now that we have the token to hand, we can set this as an environment variable on the CI. We will set this as `DEPLOIO_API_TOKEN`. We also need to set the `DEPLOIO_ORG` variable to our organisation name (in this case **'renuo'**).

In our case we are using Semaphore for our <a href="/documentation/ci_cd_integration" target="_blank">CI integration</a>. We therefore have a `.semaphore/main-deploy.yml` file. We will configure this to:

- Install and authenticate the `nctl` CLI using the ASA token
- Update the app to point to the new git revision
- Run a script which checks the deployment status and provide feedback to the CI

`main-deploy.yml`:

```
version: v1.0
name: main-deploy
agent:
  machine:
    type: e1-standard-2
    os_image: ubuntu2004

blocks:
  - name: main-deploy
    task:
      secrets:
        - name: gifcoins
      env_vars:
        - name: DEPLOIO_PROJECT
          value: renuo-gifcoins
        - name: DEPLOIO_APP_NAME
          value: main
      jobs:
        - name: main-deploy
          commands:
            - checkout --use-cache
            - echo "deb [trusted=yes] https://repo.nine.ch/deb/ /" | sudo tee /etc/apt/sources.list.d/repo.nine.ch.list
            - sudo apt-get update && sudo apt-get install nctl
            - nctl auth login --api-token=$DEPLOIO_API_TOKEN --organization=$DEPLOIO_ORG
            - nctl update application $DEPLOIO_APP_NAME --project $DEPLOIO_PROJECT --git-revision=$(git rev-parse HEAD) --build-env="RUBY_VERSION=$(cat .ruby-version)" --skip-repo-access-check
            - ruby bin/check_deploio_deployment_status.rb

```

[//]: # (TODO: update for Lukas comments)

We will also add a `bin/check_deploio_deployment_status.rb` script which will check Deploio for the build and release status, and provide feedback to the CI output.

```
require 'yaml'
require 'open3'

TIMEOUT_IN_SECONDS = 300 # 5 minutes (build & release should not take more than 5 minutes each)
INTERVAL_IN_SECONDS = 30

PROJECT = ENV['DEPLOIO_PROJECT']
APP_NAME = ENV['DEPLOIO_APP_NAME']
REVISION = `git rev-parse HEAD`.strip

def fetch_builds(project, app_name)
  command = "nctl get builds --project=#{project} --application-name=#{app_name} --output=yaml"
  stdout, stderr, status = Open3.capture3(command)

  unless status.success?
    puts "Error fetching build information: #{stderr}"
    exit 1
  end

  YAML.load_stream(stdout)
end

def fetch_releases(project, app_name)
  command = "nctl get releases --project=#{project} --application-name=#{app_name} --output=yaml"
  stdout, stderr, status = Open3.capture3(command)

  unless status.success?
    puts "Error fetching release information: #{stderr}"
    exit 1
  end

  YAML.load_stream(stdout)
end

def find_build_for_revision(builds, revision)
  builds.find do |build|
    build.dig('spec', 'forProvider', 'sourceConfig', 'git', 'revision') == revision
  end
end

def find_release_for_build(releases, build_name)
  releases.find do |release|
    release.dig('spec', 'forProvider', 'build', 'name') == build_name
  end
end

def build_status(build)
  build.dig('status', 'atProvider', 'buildStatus')
end

def release_status(release)
  release.dig('status', 'atProvider', 'releaseStatus')
end

puts "(1/2) Checking build status for revision #{REVISION}..."

# Polling mechanism for build status
elapsed = 0
build = nil
while elapsed < TIMEOUT_IN_SECONDS
  builds = fetch_builds(PROJECT, APP_NAME)
  build = find_build_for_revision(builds, REVISION)

  if build
    case build_status(build)
    when 'success'
      puts "Build succeeded for revision #{REVISION}"
      break
    when 'failed'
      puts "Build failed for revision #{REVISION}"
      exit 1
    else
      puts "Build status is #{build_status(build)}, waiting..."
    end
  else
    puts "No matching build found for revision #{REVISION}, waiting..."
  end

  sleep INTERVAL_IN_SECONDS
  elapsed += INTERVAL_IN_SECONDS
end

if elapsed >= TIMEOUT_IN_SECONDS || build.nil?
  puts "Build check timed out after #{TIMEOUT_IN_SECONDS} seconds."
  exit 1
end

# If the build is successful, proceed to check the release status
build_name = build.dig('metadata', 'name')
puts "(2/2) Checking release status for build #{build_name}..."

elapsed = 0
while elapsed < TIMEOUT_IN_SECONDS
  releases = fetch_releases(PROJECT, APP_NAME)
  release = find_release_for_build(releases, build_name)

  if release
    case release_status(release)
    when 'available'
      puts "Release is available for build #{build_name}. App has been successfully deployed ✅"
      exit 0
    when 'failed'
      puts "Release failed for build #{build_name} ❌"
      exit 1
    else
      puts "Release status is #{release_status(release)}, waiting..."
    end
  else
    puts "No matching release found for build #{build_name}, waiting..."
  end

  sleep INTERVAL_IN_SECONDS
  elapsed += INTERVAL_IN_SECONDS
end

puts "Release check timed out after #{TIMEOUT_IN_SECONDS} seconds."
exit 1
```

When you merge this, you should see the following:

- The tests run in line with your usual CI process (for example as defined by our `semaphore.yml` file).

- Once the tests are successful, this is then promoted to deploy, triggering the `main-deploy.yml` process.

- This file runs on the CI, authenticating `nctl` and updating the app running on Deploio to the new git revision, triggering a new deployment.

- We then trigger the Ruby script which provides feedback on the release. Once this has completed successfully the CI is finished and we have an updated application.
