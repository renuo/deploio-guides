---
title: CI/CD Integration
sidebar_position: 7
---

# CI/CD Integration

### Automate Deployments

Currently, when we link the GitHub repository and target revision for the application, the application will automatically re-deploy on branch changes.

If this is sufficient, the application can remain with this setup pointing to a static branch.

Otherwise, we can automate deployments using scripts and integrate deployments with CI/CD pipelines.

##### Install `nctl` in CI pipelines.

We will need to configure the CI process to install and authenticate the `nctl` CLI.

For this, we will need to set the `NCTL_API_TOKEN` variable and `NCTL_ORGANIZATION` variable on the CI environment. We can use the API Service Account (ASA) to create a token. See the next section for instructions on this.


Once this is done, we can install and authenticate `nctl` as below.

```bash
sudo apt-get update && sudo apt-get install nctl
nctl auth login
```

##### Issue tokens for secure deployment automation.

For extra security, we should create a token for the CI to use. This token can be created using the API Service Account (ASA) and can be used to authenticate the `nctl` CLI.

We create a token with:

```bash
nctl create asa {token_name}
```

and then we can view the token using:

```bash
nctl get apiserviceaccount gifcoins --print-token
```

We can then set this as the `DEPLOIO_API_TOKEN` on the CI environment.

##### Trigger deployments on code (ref) updates.

To trigger deployments on the CI, we also need to set the `DEPLOIO_PROJECT` and `DEPLOIO_APP_NAME` environment variables on the CI. We can then use the `nctl` CLI to "update" the application with the new git revision.

```bash
nctl update application $DEPLOIO_APP_NAME \
  --project $DEPLOIO_PROJECT \
  --git-revision=$(git rev-parse HEAD) \ 
  --build-env="RUBY_VERSION=$(cat .ruby-version)" \
  --skip-repo-access-check
```

#### Deployment feedback on the CI

We can also add a script to check Deploio for the build and release status, and provide feedback to the CI. 

Below is an example of this in Ruby, but this can be adapted as required.

```ruby
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

We want to trigger this script after we trigger the app deployment. With our Ruby script, we would add the below to our CI process script.

```bash
ruby bin/check_deploio_deployment_status.rb
```

#### Summary

Once the above has been put in to place, we should see the following process:

✅ The tests run in line with your usual CI process.

✅ Once the tests are successful, this is then promoted to deployment.

✅ This deployment script runs on the CI, installing and authenticating `nctl` and updating the app running on Deploio to the new git revision, triggering a new deployment on Deploio.

✅ We then trigger the script (in our case a Ruby script) which provides feedback on the release. Once this has completed successfully the CI is finished and we have an updated application running.

### Deployment Strategies

##### Rolling deployments.
##### Blue/green deployments.
