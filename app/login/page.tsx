import { redirect } from "next/navigation";
import { autorizado } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  if (autorizado()) {
    redirect("/");
  }
  return <LoginForm />;
}
