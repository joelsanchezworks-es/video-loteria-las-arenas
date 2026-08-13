import { redirect } from "next/navigation";

// The root route always sends the user to the studio.
export default function Home() {
  redirect("/studio");
}
