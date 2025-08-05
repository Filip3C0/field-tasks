import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../db/firabase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { z } from "zod";


// Schema de validação com zod
const registroSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  senha: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
  tipo: z.enum(["n1", "n2"], { message: "Selecione o cargo" }),
});

export default function Registro() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState<"n1" | "n2" | "">("");
  const navigate = useNavigate();

  const handleRegistro = async () => {
    const result = registroSchema.safeParse({ email, senha, tipo });

    if (!result.success) {
      result.error.issues.forEach((err) => toast.error(err.message));
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        email: email.toLowerCase(),
        tipo,
      });

      toast.success("Conta criada com sucesso!");
      navigate("/");
    } catch (error: any) {
      console.error("Erro no registro:", error);
      let mensagem = "Erro ao criar conta";

      if (error.code === "auth/email-already-in-use") {
        mensagem = "E-mail já está em uso";
      } else if (error.code === "auth/weak-password") {
        mensagem = "A senha deve ter pelo menos 6 caracteres";
      } else if (error.code === "auth/invalid-email") {
        mensagem = "E-mail inválido";
      }

      toast.error(mensagem);
    }
  };

  return (
    <div className="flex !p-6  items-center justify-center h-screen bg-zinc-900 text-white">
      <div className="flex flex-col !pt-6 !pb-4 bg-zinc-800 p-6 rounded-lg w-[400px] items-center space-y-4 shadow-lg">
        <h2 className="!mb-4 !text-2xl font-bold text-center">Criar Conta</h2>

        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-[360px] h-10 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !text-zinc-100 hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3"
        />

        <Input
          type="password"
          placeholder="Senha (mín. 6 caracteres)"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-[360px] h-10 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !text-zinc-100 hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3"
        />

        <Select onValueChange={(value: "n1" | "n2") => setTipo(value)}>
          <SelectTrigger className="w-[360px] h-10 !pl-3 !border-1 !border-zinc-500 !text-zinc-400 !hover:border-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500">
            <SelectValue placeholder="Selecione o seu cargo" />
          </SelectTrigger>
          <SelectContent className="!bg-zinc-700 text-zinc-200 rounded-none">
            <SelectItem value="n1" className="!pl-3 !mb-1 rounded-none hover:bg-zinc-400 !w-full !h-7">
              Sou N1 (Solicitante)
            </SelectItem>
            <SelectItem value="n2" className="!pl-3 !mb-1 rounded-none hover:bg-zinc-400 !w-full !h-7">
              Sou N2 (Atendente)
            </SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="submit"
          variant="secondary"
          onClick={handleRegistro}
          className="!mt-4 !mb-4 !bg-zinc-300 !rounded-2xl !text-zinc-950 w-[100px]"
        >
          Criar Conta
        </Button>
      </div>
    </div>
  );
}
