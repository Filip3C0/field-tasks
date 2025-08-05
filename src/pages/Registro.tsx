import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../db/firabase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import toast from "react-hot-toast";

export default function Registro() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipo, setTipo] = useState<"n1" | "n2">("n1");
  const navigate = useNavigate();

  const handleRegistro = async () => {
    if (!email || !senha) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Salvar tipo no Firestore
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
    <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">
      <div className="bg-zinc-800 p-6 rounded-lg w-[300px] space-y-4 shadow-lg">
        <h2 className="text-xl font-bold text-center">Criar Conta</h2>
        
        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <Input
          type="password"
          placeholder="Senha (mín. 6 caracteres)"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value as "n1" | "n2")}
          className="w-full p-2 rounded bg-zinc-700 text-white"
        >
          <option value="n1">Sou N1 (Solicitante)</option>
          <option value="n2">Sou N2 (Atendente)</option>
        </select>

        <Button className="w-full" onClick={handleRegistro}>
          Criar conta
        </Button>
      </div>
    </div>
  );
}
