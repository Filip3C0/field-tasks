import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../db/firabase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast, Toaster } from "react-hot-toast";
import { z } from "zod";
import LoginImage from "../assets/helpdesk.gif";

// Validação com zod
const loginSchema = z.object({
  email: z.string().email({ message: "Verique suas informações" }),
  senha: z.string().min(6, { message: "Verique suas informações" }),
});

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
   

    const toastId = toast.loading("Verificando credenciais...", {
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
    <div className="min-h-screen flex items-center justify-center !bg-gradient-to-b !from-[#0a0a23] !to-[#1a1a2e] text-zinc-200 ">
      <Toaster position="top-right" />
      <div className="flex flex-col items-center rounded-md
      !border-1 !border-cyan-500 !shadow-cyan-500 !shadow-xl/50 !p-6 inset-shadow-sm inset-shadow-cyan-500">
       
        <div className="flex justify-center mb-6">
          <img
            src={LoginImage}
            alt="Login Icon"
            className="w-20 h-16 rounded-full shadow-md shadow-cyan-500 !mt-3"
          />
        </div>
        <h2 className="!text-2xl !font-bold !text-center  !mt-3">Bem-vindo de volta!</h2>
        <p className="!text-sm text-zinc-400 !text-center !mb-4 ">Coloque suas credenciais para entar</p>


        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="cursor-pointer w-[360px] h-11 !mb-4 !bg-zinc-850 !border-1 !rounded-2xl !border-zinc-500 
          !text-zinc-100 hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3"
        /> 

        <Input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="cursor-pointer w-[360px] h-11 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !rounded-2xl !text-zinc-100
          hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3"
        />

        <Button
          type="submit"
          variant="secondary"
          onClick={handleLogin}
          className="!mt-4 !mb-4 !bg-cyan-300 !rounded-2xl !text-black w-full hover:underline"
        >
          Entrar
        </Button>

        <p
          onClick={() => navigate("/registro")}
          className="text-sm text-zinc-400 hover:underline text-center cursor-pointer"
        >
          Ainda não tem cadastro? Criar uma conta
        </p>
      </div>
    </div>
  );
}
