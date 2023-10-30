# Hello, Welcome to development page 🔥
> Application Reflective Open-ended concept mapping build with 💖 by [zakacoding](https://zakacoding.github.io).
This branch for develop web into Desktop Application using electron, so you can run local computer. for those using this app and install on your computer i'am realy appreciate 🥰

#### Prerequites
-   [x] PHP version 8 or above
-   [x] composer
-   [x] Node (who can running vite, because this project using laravel 10)

#### How to run electron on local environment 🚀
> you must have access on main repo `web-based-cmap` to run this :). btw that branch is private only.

```bash
 git clone https://github.com/ZakaCoding/open-cmap.git
```
```bash
 cd open-cmap
```
```bash
  npm install
```
```bash
 cd src\www
```
```bash
 composer install
```
```bash
 npm install
```
```bash
 cp .env.example .env
```
```bash
 php artisan migrate
```
```bash
 cd ..
```

##### In this step you already install all depedencies, you can run next step.
```bash
 npm start
```
Congratulation 🎉! You are app is running now! Go to www directory edit start working on laravel project and that can modify open-cmap

#### Build into exe file
```bash
 cd src\www
```
```bash
 npm run build
```
Back to root folder (outside src folder)
```bash
 cd .. && cd ..
```
```bash
 npm run make
```

#### Publish package with electron
> Don't forget to setup cors.php on www folder, because installation process will run error. be patient :)

##
For researcher feel free to chit chat with me, i am online and ready to help you guys. You can mail me [zakanoor@outlook.co.id](mailto:zakanoor@outlook.co.id) or DM on my IG's :), here my ID's [youn8e_](https://instagram.com/youn8e_)

CHEERSSS... 🥂
