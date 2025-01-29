import os
from pathlib import Path
from datetime import timedelta
import sys
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv("SECRET_KEY", "578p1c198#g_-9#!--a^08kq!ns6&pjd0mafa=f#tq!3nc&+y9")

DEBUG = False

ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "corsheaders",
    "learn",
    "django.contrib.admin",
    "django.contrib.auth",
    'whitenoise',
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "drf_spectacular",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "django_apscheduler",
    "storages",
]

CORS_ORIGIN_WHITELIST = [
    "http://localhost:5173",
    "https://ambitious-stone-00aad4900.4.azurestaticapps.net",
    "https://KipNexus.vercel.app",
]

CORS_EXPOSE_HEADERS = [
    "X-Session-ID",
    "Content-Type",
    "X-CSRFToken",
]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
    "x-session-id",
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:8000"
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "https://KipNexus.vercel.app",
    "https://KipNexus.pro",
    "https://api.KipNexus.pro",
]

CSRF_COOKIE_SAMESITE = "None"
CSRF_COOKIE_HTTPONLY = False
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "None"
CORS_ALLOW_CREDENTIALS = True
CSRF_USE_SESSIONS = True

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "KipNexus.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "KipNexus.wsgi.application"

if "test" in sys.argv:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    import os

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("POSTGRES_DB", "kipkirui_ventures"),  
        "USER": os.environ.get("POSTGRES_USER", "kipkirui_user"),    
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD", "kipkiruiventures102"), 
        "HOST": os.environ.get("POSTGRES_HOST", "localhost"), 
        "PORT": os.environ.get("POSTGRES_PORT", "5432"),  
    }
}


AUTH_USER_MODEL = "learn.User"

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = os.environ.get("STATIC_ROOT", "/staticfiles")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "learn.authentication.HeaderSessionAuthentication",
    ],
}

SPECTACULAR_SETTINGS = {
    "TITLE": "KipNexus LMS API",
    "DESCRIPTION": "This is the REST API for the KipNexus Learning Management System. It provides endpoints for managing and accessing courses, lessons, user profiles, and progress tracking in the field of fitness and calisthenics.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=4),
}

APSCHEDULER_DATETIME_FORMAT = "N j, Y, g:i a"
APSCHEDULER_RUN_NOW_TIMEOUT = 40

if DEBUG:
    MEDIA_ROOT = os.path.join(BASE_DIR, "images")
    MEDIA_URL = "/images/"
else:
    DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
    AWS_ACCESS_KEY_ID = os.environ.get("DO_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.environ.get("DO_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME = "KipNexus-media"
    AWS_S3_ENDPOINT_URL = "https://sgp1.digitaloceanspaces.com"
    AWS_S3_CUSTOM_DOMAIN = "KipNexus-media.sgp1.cdn.digitaloceanspaces.com"
    AWS_S3_REGION_NAME = "sgp1"
    AWS_LOCATION = "media"
    AWS_DEFAULT_ACL = "public-read"
    AWS_QUERYSTRING_AUTH = False
    AWS_S3_FILE_OVERWRITE = False
    MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/{AWS_LOCATION}/"