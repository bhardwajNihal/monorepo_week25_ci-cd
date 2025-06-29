import {prismaClient} from "@repo/db/client"
import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("hello from the server");
})

app.post("/signup", async(req, res) => {

    try {
        const {username, password} = await req.body;
    
        await prismaClient.user.create({
            data : {
                username, 
                password
            }
        })
    
        res.status(200).json({
           message : "user signed up!" 
        })
    } catch (error:any) {
        res.status(500).json({
           message : "error signing up!",
           Error : error.message 
        })
    }

})

app.listen(3001, ()=>{
    console.log("server listening on port 3001");
})