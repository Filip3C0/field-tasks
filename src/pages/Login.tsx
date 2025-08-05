import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../db/firabase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // Buscar o tipo de usuário no Firestore
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const tipo = docSnap.data().tipo;

        toast.success("Login realizado com sucesso!");

        if (tipo === "n1") {
          navigate("/novo-chamado"); // ou a rota que você usa para N1
        } else if (tipo === "n2") {
          navigate("/lista"); // ou a rota que você usa para N2
        } else {
          toast.error("Tipo de usuário inválido.");
        }
      } else {
        toast.error("Usuário não encontrado no banco de dados.");
      }
    } catch (error: any) {
      console.error("Erro no login:", error);
      toast.error(
        "Erro no login" + (error.message ? `: ${error.message}` : "")
      );
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-zinc-900 text-white">
      <div className="bg-zinc-800 p-6 rounded-lg w-[300px] space-y-4 shadow-lg">
        <h2 className="text-xl font-bold text-center">Login</h2>

        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <Button className="w-full" onClick={handleLogin}>
          Entrar
        </Button>

        <p
          onClick={() => navigate("/registro")}
          className="text-sm text-zinc-400 hover:underline text-center cursor-pointer"
        >
          Criar uma conta
        </p>
      </div>
    </div>
  );
}
