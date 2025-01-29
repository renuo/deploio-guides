---
title: Migrating from Other Platforms
sidebar_position: 11
---

# Migrating from Other Platforms

### Retrieving and restoring databases

##### How to / link to guides

### Fetching environment variables

##### Retrieving environment variables from Heroku

Below is an example of a shell script that you can use. You will need to replace the `heroku_project` variable with your desired project, and the output will be a list of environment variables from the project which can then be passed when creating the application using the `nctl` command line.

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
nctl update app gifcoins --env='ADMIN_EMAIL=admin@damin.ch;ADMIN_PASSWORD=password'
```

**Disclaimer:**

Please be aware that this is just an example of how to automate retrieving the environment variables. The user should make sure that they understand the script, which environment variables that they require, and thoroughly check the output.



### Updating DNS records

##### How to / link to guides

##### Considerations and disabling that mode on Cloudfare

### Adapting deployment workflows for Deploio

##### CI? Anything else?

