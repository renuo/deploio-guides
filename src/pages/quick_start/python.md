---
title: Python
description: Python
---

# Python

The Deploio build environment makes use of the [Paketo Python Buildpack](https://paketo.io/docs/reference/python-reference/).

## Example App

We have a basic Python Django app in our [examples repository](https://github.com/ninech/deploio-examples#python). 
You can deploy it with `nctl`. 
The example application shows a random message on every page reload. 
The Django admin interface can be used to add messages. 
Just visit `https://<URL of app>/admin` to access it and use the credentials which you pass via the env variables below to login. 
Please also define the `SECRET_KEY` which is needed to secure signed data and should be kept secret.

```bash
nctl create application django-example \
  --git-url=https://github.com/ninech/deploio-examples \
  --git-sub-path=python/django \
  --env=DJANGO_SU_NAME=admin \
  --env=DJANGO_SU_EMAIL=admin@example.com \
  --env=DJANGO_SU_PASSWORD=<INSERT A PASSWORD HERE> \
  --env=SECRET_KEY=<LONG RANDOM STRING>
```

## Build env considerations

There are just a few build environment variables supported by the Python buildpack. 
You can find them in the [Paketo documentation](https://paketo.io/docs/reference/python-reference/).

## Django specifics

### Procfile

If you have a Django application, you will need to create a Procfile in the root of your app source code, 
which changes the default "web" entrypoint to a valid [wsgi project configuration file](https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/), 
which will be served by gunicorn. For example, the `Procfile` in our example app looks like:

```yaml
web: gunicorn deploio.wsgi
```

### Configuring `ALLOWED_HOSTS`

The `ALLOWED_HOSTS` setting represents the permitted hostnames/domains which the Django site can serve. 
To allow the default Deploio URLs for your application, you can use the following entry in your `settings.py` file:

```python
ALLOWED_HOSTS = [".deploio.app"]
```

Please note that you will need to add all of your custom domain names to this list. 
So if you want your application to be served on `django-app.example.com` your `ALLOWED_HOSTS` should look like:

```python
ALLOWED_HOSTS = [
    "deploio.app",
    "django-app.example.com",
]
```

### Configuring the `SECRET_KEY`

The `SECRET_KEY` parameter is used to secure signed data in Django. 
It should be kept secure and so not be stored alongside your application code. 
One way of specifying it is to load it from the environment. 
You can achieve this by using the following line in your `settings.py`:

```python
# The secret key can be passed via the env variable "SECRET_KEY"
SECRET_KEY = os.environ.get('SECRET_KEY')
if SECRET_KEY == None:
    raise ValueError("SECRET_KEY environment variable must be set")
```

You then need to specify the environment variable `SECRET_KEY` with `nctl` as you can see in the 
[Example app section](#example-app).
