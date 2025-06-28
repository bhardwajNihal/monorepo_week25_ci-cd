

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