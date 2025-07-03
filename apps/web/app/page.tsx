import {prismaClient} from "@repo/db/client"

export default async function Home() {

  const user = await prismaClient.user.findFirst();
  
  return (
    <div>
      hello, mr {user?.username}.
      <br />
      <p>welcome back!!!</p>
    </div>
  );
}
