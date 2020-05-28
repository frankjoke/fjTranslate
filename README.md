# fjTranslate

## Project setup
```
npm install
```
if you want to run a local exe-copy in windows you can download it from `https://github.com/frankjoke/fjTranslate/tree/master/dist_electron`. Just download the Zip and extract it to a user writeable directory. fjTranslate.exe can then be executed from there.

On Linux you can clone the full repo and the install everythings and `npm run electron:serve` to run it in development mode.
I did not manage to create a linux package so far...

### Compiles and hot-reloads for development
```
npm run electron:serve
```

### Compiles and minifies for production
```
npm run electron:build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration

create/save config.json in directory of built app or add file location in environment under `FJTRANSLATE_CONFIG`
The yandex-key can be also put into environment under `FJTRANSLATE_YANDEXKEY` so you don't need to put it into config file....

## Description

fjTranslate helps to translate words.js or other *.json files.
It implements also a sort of globalö-words file which will get all translations (if you want) automatically added as well and if it exists and is used the translator will look into this file first and make external calls to google or yandex only it it not found in global file.

In this way external translation load is reduced dramatically which helps to get more translations done with free google servide.

The translator can be configured to use google and yandex, also to select which one to try first.
If you let google go first and google runs into error 429 (too many requests) it wiil switch to yandex if the key is available (either in config or in environment).


