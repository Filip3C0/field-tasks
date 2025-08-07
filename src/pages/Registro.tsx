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
  name: z.string().min(1, { message: "E-mail inválido" }).max(50, { message: "Nome muito longo" }),
  email: z.string().email({ message: "E-mail inválido" }),
  senha: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
  tipo: z.enum(["n1", "n2"], { message: "Selecione o cargo" }),
});

export default function Registro() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState<"n1" | "n2" | "">("");
  const [predio, setPredio] = useState<"Adm" | "Cível" | "Palácio" | "Cidadania" | "Criminal" | "">("");

  const navigate = useNavigate();

  const handleRegistro = async () => {
    if (!name || !email || !senha || !tipo || (tipo === "n2" && !predio)) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const result = registroSchema.safeParse({ name, email, senha, tipo });

    if (!result.success) {
      result.error.issues.forEach((err) => toast.error(err.message));
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        name,
        email,
        tipo,
        predio: tipo === "n1" ? "Adm" : predio,
      });

      toast.success("Usuário registrado com sucesso!");
      navigate("/");
    } catch (error) {
      console.error("Erro ao registrar:", error);
      toast.error("Erro ao registrar usuário.");
    }
  };

  return (
    <div className="flex !p-6  items-center justify-center h-screen bg-zinc-900 text-white">
      <div className="flex flex-col !pt-6 !pb-4 bg-zinc-800 p-6 rounded-lg w-[400px] items-center space-y-4 shadow-lg">
        <h2 className="!mb-4 !text-2xl font-bold text-center">Criar Conta</h2>

        <Input
          type="name"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-[360px] h-10 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !text-zinc-100 hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3"
        />

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
          <SelectTrigger className="w-[360px] h-10 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !text-zinc-400 hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3">
            <SelectValue placeholder="Selecione o seu cargo" />
          </SelectTrigger>
          <SelectContent className="!bg-zinc-700 text-zinc-200">
            <SelectItem value="n1">Sou N1 (Service Desk)</SelectItem>
            <SelectItem value="n2">Sou N2 (Field Service)</SelectItem>
          </SelectContent>
        </Select>

        {tipo === "n2" && (
          <Select onValueChange={(value) => setPredio(value as typeof predio)}>
            <SelectTrigger className="w-[360px] h-10 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !text-zinc-400 hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3">
              <SelectValue placeholder="Selecione o seu Prédio" />
            </SelectTrigger>
            <SelectContent className="!w-[360px]  !bg-zinc-700 text-zinc-200">
              <SelectItem value="Adm">Adm</SelectItem>
              <SelectItem value="Cível">Cível</SelectItem>
              <SelectItem value="Palácio">Palácio</SelectItem>
              <SelectItem value="Cidadania">Cidadania</SelectItem>
              <SelectItem value="Criminal">Criminal</SelectItem>
            </SelectContent>
          </Select>
        )}



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
