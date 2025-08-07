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
import RegisterImage from "../assets/registered.gif";



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
    <div className="min-h-screen flex items-center justify-center !bg-gradient-to-b !from-[#0a0a23] !to-[#1a1a2e] text-zinc-200 ">
      <div className="flex flex-col items-center rounded-md
      !border-1 !border-cyan-500 !shadow-cyan-500 !shadow-xl/50 !p-6 inset-shadow-sm inset-shadow-cyan-500">
        <div className="flex justify-center mb-6">
          <img
            src={RegisterImage}
            alt="Login Icon"
            className="w-20 h-16 rounded-full shadow-md shadow-cyan-500 !mt-3"
          />
        </div>
        <h2 className="!text-2xl !font-bold !text-center !mb-3 !mt-3">Crie sua conta!</h2>
        <Input
          type="name"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="cursor-pointer w-[360px] h-11 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !rounded-2xl !text-zinc-100
          hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3"
        />

        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="cursor-pointer w-[360px] h-11 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !rounded-2xl !text-zinc-100
          hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 !pl-3"
        />

        <Input
          type="password"
          placeholder="Senha (mín. 6 caracteres)"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="cursor-pointer w-[360px] h-11 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !rounded-2xl !text-zinc-100
          hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3"
        />

        <Select onValueChange={(value: "n1" | "n2") => setTipo(value)}>
          <SelectTrigger className="cursor-pointer w-[360px] h-11 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !rounded-2xl !text-zinc-400
          hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3">
            <SelectValue placeholder="Selecione o seu cargo" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 text-zinc-200 h-auto !shadow-cyan-500 !shadow-xl/50 !p-2 inset-shadow-sm inset-shadow-cyan-500">
            <SelectItem className="h-[30px !p-2" value="n1">Sou N1 (Service Desk)</SelectItem>
            <SelectItem className="h-[30px] !p-2" value="n2">Sou N2 (Field Service)</SelectItem>
          </SelectContent>
        </Select>

        {tipo === "n2" && (
          <Select onValueChange={(value) => setPredio(value as typeof predio)}>
            <SelectTrigger className="cursor-pointer w-[360px] h-11 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !rounded-2xl !text-zinc-400
          hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3">
              <SelectValue placeholder="Selecione o seu Prédio" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 text-zinc-200 h-auto !shadow-cyan-500 !shadow-xl/50 !p-2 inset-shadow-sm inset-shadow-cyan-500">
              <SelectItem className="h-[30px] !p-2" value="Adm">Adm</SelectItem>
              <SelectItem className="h-[30px] !p-2" value="Cível">Cível</SelectItem>
              <SelectItem className="h-[30px] !p-2" value="Palácio">Palácio</SelectItem>
              <SelectItem className="h-[30px] !p-2" value="Cidadania">Cidadania</SelectItem>
              <SelectItem className="h-[30px] !p-2" value="Criminal">Criminal</SelectItem>
            </SelectContent>
          </Select>
        )}



        <Button
          type="submit"
          variant="secondary"
          onClick={handleRegistro}
          className="!mt-4 !mb-4 !bg-cyan-300 !rounded-2xl !text-black w-full hover:underline"
        >
          Criar Conta
        </Button>
      </div>
    </div>
  );
}
