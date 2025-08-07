import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../db/firabase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast, Toaster } from "react-hot-toast";
import { z } from "zod";

// Validação com zod
const loginSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }),
  senha: z.string().min(6, {message:"Senha Inválida "}),
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const resultado = loginSchema.safeParse({ email, senha });

    if (!resultado.success) {
      resultado.error.issues.forEach((err) => {
        toast.error(err.message, { icon: "⚠️" });
      });
      return;
    }

    const toastId = toast.loading("Verificando credenciais...",{
      position: "top-right",
      duration: 4000,
      icon: "🔍",
    });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const tipo = docSnap.data().tipo;

        toast.success("Login realizado com sucesso!", {
          id: toastId,
          icon: "✅",
          duration: 4000,
        });

        if (tipo === "n1") {
          navigate("/novo-chamado");
        } else if (tipo === "n2") {
          navigate("/lista");
        } else {
          toast.error("Tipo de usuário inválido.", {
            id: toastId,
            icon: "❌",
          });
        }
      } else {
        toast.error("Usuário não encontrado no banco de dados.", {
          id: toastId,
          icon: "❌",
        });
      }
    } catch (error: any) {
      console.error("Erro no login: senha ou e-mail inválidos");
      toast.error("Erro no login: Verifique suas credenciais.", {
        id: toastId,
        icon: "❌",
      });
    }
  };

  return (
    <div className="flex !p-6 items-center justify-center h-screen bg-zinc-900 text-white">
      <Toaster position="top-right" />
      <div className="flex flex-col bg-zinc-800 !p-6 rounded-lg w-[400px] items-center space-y-4 shadow-lg">
        <h2 className="!text-2xl !font-bold !text-center !mb-4 !mt-3">Login</h2>

        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-[360px] h-10 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !text-zinc-100 hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3"
          
        />

        <Input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-[360px] h-10 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !text-zinc-100 hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3"
         />

          <Button
          type="submit"
          variant="secondary"
          onClick={handleLogin}
          className="!mt-4 !mb-4 !bg-zinc-300 !rounded-2xl !text-zinc-950 w-[100px] hover:underline"
        >
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
