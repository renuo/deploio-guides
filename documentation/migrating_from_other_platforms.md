---
title: Migrating from Other Platforms
sidebar_position: 11
---

# Migrating from Other Platforms

With Deploio, it is extremely easy to migrate an application, and all resources, from other providers. In this section we will provide information on how to migrate environment variables, databases, as well as how to adapt the DNS records and CI workflows.

Most example will focus on migrating from Heroku, however this can be adapted should you be migrating from another provider.

### Retrieving and restoring databases





### Retrieving environment variables

Below is an example of a shell script that you can use for retrieving environment variables. Depending on the platform you are migrating from, and whether they have a comprehensive CLI infrastructure, this could be adapted for your case.

In the below example, you would need to replace the `heroku_project` variable with your project name. The output will be a list of environment variables from the project which can then be passed when creating the application using the `nctl` command line. The [Heroku cli](https://devcenter.heroku.com/articles/heroku-cli) and [`jq` command line utility](https://jqlang.github.io/jq/) have to be installed.

`env-migration.sh`:
```shell
#!/bin/sh
set -e

# Function to convert JSON to --env='KEY=VALUE;KEY=VALUE;...' format
convert_json_to_env() {
    local json_input="$1"
    # Process the JSON input and format it accordingly
    echo "--env='"$(echo "$json_input" | jq -r 'to_entries | map("\(.key)=\(.value|tostring)") | join(";")')"'"
}

# Fetching JSON input from Heroku config
heroku_project="heroku_project"
json_input=$(heroku config -a $heroku_project -j)
echo "$json_input"

# Check if json_input is empty
if [ -z "$json_input" ]; then
    echo "Error: Could not fetch Heroku config or config is empty."
    exit 1
fi

# Converting JSON to --env='KEY=VALUE;KEY=VALUE;...' format
env_arguments=$(convert_json_to_env "$json_input")

# Print the result
echo "$env_arguments"
```

The script can also be adapted as required, for example we could use the below **grep** to to avoid setting environment variables that start with `HEROKU`.

```
jq 'to_entries | map(select(.key | startswith("HEROKU") | not)) | map("\(.key)=\(.value)") | join(";")
```

Once you are happy with the script, you can then simply run `zsh env-migration.sh` and the output will look something like this:

```
{
"ADMIN_EMAIL": "admin@admin.ch",
"ADMIN_PASSWORD": "password"
}
--env='ADMIN_EMAIL=admin@damin.ch;ADMIN_PASSWORD=password'
```

The second output can now be passed when creating the application. We can just keep these at hand for when we create the application, or, if the application is already created, we can update using the below command:

```
nctl update application gifcoins --env='ADMIN_EMAIL=admin@damin.ch;ADMIN_PASSWORD=password'
```

**Disclaimer:**

Please be aware that this is just an example of how to automate retrieving the environment variables. The user should make sure that they understand the script, which environment variables that they require, and thoroughly check the output.

### Updating DNS records

Given that we now have a new url for the application, we will need to update the DNS records to point to the new application running on Deploio.

##### An example using Cloudflare

Below we go through an example of adapting this where we use Cloudflare to manage our DNS records..

[//]: # (TODO: show an example with some images)

##### Considerations

It may be that you need to disable the "proxy mode"... 

[//]: # (TODO: show an example with some images)

### Adapting deployment workflows for Deploio

Currently, when we link the GitHub repository and target revision for the application, the application will automatically re-deploy on branch changes. 

If this is sufficient, the application can remain with this setup pointing to a static branch.

##### Integrating to the CI

On the other hand, should you wish to integrate the deployment process to the CI, allowing the test suite to run before deployment, we can adapt the process to do so.

[//]: # (TODO: add from migration guide)

### How to guides

Please see a list below of "how to" guides for migrating to Deploio:

- <a href="/ruby_heroku_migration_guide" target="_blank">Learn how to migrate an app from Heroku to Deploio</a>

