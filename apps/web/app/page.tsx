import {prismaClient} from "@repo/db/client"

export default function Home() {

  prismaClient.user.create({
    data : {
      username : "nihal",
      password : "nihal123"
    }
  })
  return (
    <div>
      hello
    </div>
  );
}
