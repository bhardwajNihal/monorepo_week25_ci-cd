

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


## CI script to deploy changes app as soon as a push happens to main branch.

1. SSH Key Pair Setup
    - generated a key pair to allow GitHub Actions to connect to EC2.
    - Used: ssh-keygen -t ed25519 -C "github-actions"
    - Added public key (.pub) to EC2 instance's ~/.ssh/authorized_keys.
    - Stored private key (full content including -----BEGIN...END-----) in GitHub Secrets as EC2_SSH_KEY.

2. GitHub Secrets
    EC2_SSH_KEY	-  Private SSH key for GitHub Actions to use
    EC2_HOST	-  EC2's public IP (e.g., 13.233.xxx.xxx)
    EC2_USER	-  ubuntu (vm's select OS)

3. script in .github/workflows/deploy.yaml
    name: Deploy to EC2 on push

    on:
    push:
        branches:
        - main

    jobs:
    deploy:
        name: Deploy to EC2 as soon as any change is pushed to main
        runs-on: ubuntu-latest

        steps:
        - name: Checkout code (fetch repo to GitHub VM)
        uses: actions/checkout@v3

        - name: Setup SSH (GitHub identity for EC2 to recognize it)
        run: |
            mkdir -p ~/.ssh
            echo "${{ secrets.EC2_SSH_KEY }}" > ~/.ssh/id_ed25519
            chmod 600 ~/.ssh/id_ed25519
            ssh-keyscan ${{ secrets.EC2_HOST }} >> ~/.ssh/known_hosts

        - name: SSH and deploy changes to EC2
        run: |
            ssh ${{ secrets.EC2_USER }}@${{ secrets.EC2_HOST }} '
            export PATH=$PATH:/home/ubuntu/.nvm/versions/node/v22.17.0/bin &&
            cd ~/monorepo_week25_ci-cd &&
            echo "Pulling latest changes..." &&
            git pull origin main &&
            echo "Installing dependencies..." &&
            pnpm install &&
            echo "Building apps..." &&
            pnpm run build &&
            echo "Reloading PM2 apps..." &&
            pm2 reload all || true &&
            echo "Starting apps via PM2..." &&
            pm2 start npm --name http-server -- run start --prefix apps/http-server &&
            pm2 start npm --name next-fe -- run start --prefix apps/web &&
            pm2 start npm --name ws-server -- run start --prefix apps/ws-server &&
            echo "✅ Deploy complete!"
            '
    # note
        - provide path to node is important, without it, process can't be run
        - as packages are though installed, but path to it is unknown, hence can't be used in github temporarily set VM (set to ssh into original remote VM)