

- initialize a monoropo via turborepo
- delete the prebuild docs folder inside /app
- in the packages folder add prisma folder, to hold all db related stuffs
    >> initialize a node project by adding a package.json
        >> name the repo as "@repo/db"
    >> add tsconfig.json file, extend it to typescript-config prebuild
    >> before that add @repo/typescript-config as a devdependency
    >> add compilorOptions rootdir to ./src, and outdir as ./dist in the tsconfig

    >> install prisma
        >> npx prisma --init >> add user model
        >> get neon db creds
        >> npx prisma migrate dev >> npx prisma generate
        >> add src/index.js >> initialize prisma client and export it
    >> add build script
    >> add export alias ./client : "./dist/index.js"
        >> so as to import the client exported from "@repo/prisma/client";

    
    - initialized a simple http and websocket server
    - connected all the apps with the common db package


# Deployment
    - create two instances (ec2)
    1. dev - to push code while development stage
    2. prod - to push the final ready application, intended for real users

    - install node (following the DO blog)
    - install nginx to both the servers
        >> sudo apt update 
        >> sudo apt install nginx
    - install pm2 to both   
        >> npm install -g pm2


    - clone the git repo
    - >> pnpm install
    - >> build the project
    - >> finally start via pm2
        >> cd http-server 
        >> pm2 start --name http-server -- run start  (to start via app script);
    - >> configure nginx   
        - /etc/nginx/sites-available/monorepo_ci_cd
        - server {
            listen 80;
            server_name 13.60.192.42;

            location / {
                proxy_pass http://localhost:3000;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;  # <-- THIS IS CRUCIAL
                proxy_cache_bypass $http_upgrade;
            }

            location /http/ {
                proxy_pass http://localhost:3001/;
                proxy_http_version 1.1;
                proxy_set_header Host $host;
            }

            location /ws/ {
                proxy_pass http://localhost:3002/;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_set_header Host $host;
            }
        }
        - link it
            >> sudo ln -s /etc/nginx/sites-available/[created_config_filename] /etc/nginx/sites-enabled/
        - finally
            >> sudo nginx -t  
            >> sudo systemctl restart nginx

    # all the processes are now successfully running on the clean urls

