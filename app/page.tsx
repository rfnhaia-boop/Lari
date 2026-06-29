import { redirect } from "next/navigation";
import { Hub } from "@/components/hub";
import { autorizado, autenticacaoAtiva } from "@/lib/auth";

export default function Page() {
  if (!autorizado()) {
    redirect("/login");
  }
  return <Hub mostrarSair={autenticacaoAtiva()} />;
}
