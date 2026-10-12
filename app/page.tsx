import {ModeToggle} from "@/components/ui/mode-toggle";
import {Button} from "@/components/ui/button";
import {signOutAction} from "@/modules/auth/actions";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-4 bg-zinc-50 font-sans dark:bg-black">

        <ModeToggle/>
      <h1> Bruhhhh</h1>

        <form action={signOutAction}>
            <Button type="submit">Log out</Button>
        </form>
    </div>
  );
}
