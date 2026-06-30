import { redirect } from "next/navigation";
import { autorizado } from "@/lib/auth";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
  if (autorizado()) {
    redirect("/");
  }
  return <SignupForm />;
}
