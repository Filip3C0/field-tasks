import { useEffect, useState } from "react";
import { db, auth } from "../db/firabase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent } from "../components/ui/card";
import { Toggle } from "../components/ui/toggle";
import { BookmarkCheck } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/ui/avatar";

interface Chamado {
  id: string;
  chamado: string;
  solicitante: string;
  descricao: string;
  setor: string;
  sala?: string;
  predio?: string;
  resolvido?: boolean;
  resolvidoEm?: string;
  criadoEm?: any;
}


export default function ListaChamados() {
  const navigate = useNavigate();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState("");
  const [predioUsuario, setPredioUsuario] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const buscarChamados = async (predio: string) => {
    setCarregando(true);
    try {
      const chamadosRef = collection(db, "chamados");
      const q = query(chamadosRef, where("predio", "==", predio));
      const snapshot = await getDocs(q);
      const resultado: Chamado[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Chamado[];
      setChamados(resultado);
    } catch (error) {
      console.error("Erro ao buscar chamados:", error);
      toast.error("Erro ao buscar chamados.");
    } finally {
      setCarregando(false);
    }
  };

  const marcarComoResolvido = async (id: string) => {
    try {
      const docRef = doc(db, "chamados", id);
      const dataAtual = new Date().toISOString();

      await updateDoc(docRef, {
        resolvido: true,
        resolvidoEm: dataAtual,
      });

      setChamados((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, resolvido: true, resolvidoEm: dataAtual } : c
        )
      );

      toast.success("Chamado resolvido com sucesso!");
    } catch (error) {
      console.error("Erro ao marcar como resolvido:", error);
      toast.error("Erro ao marcar como resolvido.");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserName(data.name || user.email);
            setUserPhoto(data.photoURL || "");
            setPredioUsuario(data.predio || null);
            if (data.predio) buscarChamados(data.predio);
          } else {
            setUserName(user.email);
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
          toast.error("Erro ao buscar dados do usuário.");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col items-center h-screen w-full bg-zinc-700 text-white">
      <div className="flex items-center justify-around !p-4 !gap-4">
        <Avatar>
          {userPhoto ? (
            <AvatarImage src={userPhoto} />
          ) : (
            <AvatarImage
              src={`https://api.dicebear.com/8.x/initials/svg?seed=${userName}`}
            />
          )}
          <AvatarFallback>{userName?.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="text-lg font-semibold">{userName}</span>
        <Button
          onClick={handleLogout}
          className="!bg-red-400 !rounded-sm !px-4 py-1 h-auto text-white"
        >
          Sair
        </Button>
      </div>

      <div className="flex flex-col w-[350px] max-w-3xl !p-6">
        <h2 className="text-lg text-center text-zinc-300 mb-4">
          Seu prédio atual: {predioUsuario || "Carregando..."}
        </h2>

        {carregando && <p className="text-indigo-200">Carregando chamados...</p>}

        {!carregando && chamados.length === 0 && predioUsuario && (
          <p className="text-zinc-200">Nenhum chamado encontrado.</p>
        )}
      </div>

      <div className="space-y-8">
        {chamados.map((chamado) => (
          <Card
            key={chamado.id}
            className={`flex flex-col !mb-3 items-start  transition-opacity duration-300 ${
              chamado.resolvido ? "opacity-50" : "opacity-100"
            }`}
          >
            <div className="flex flex-row w-full">
              <CardContent className="w-[500px] !pl-2 !pb-3 !pt-3 flex flex-col gap-1 mb-4 bg-zinc-950 rounded-lg text-white">
                <span>
                  <strong>Chamado:</strong> {chamado.chamado}
                </span>
                <span>
                  <strong>Solicitante:</strong> {chamado.solicitante}
                </span>
                <span>
                  <strong>Descrição:</strong> {chamado.descricao}
                </span>
                <span>
                  <strong>Setor:</strong> {chamado.setor}
                </span>
                <span>
                  <strong>Sala:</strong> {chamado.sala || ""}
                </span>
                <span>
                  <strong>Data criação:</strong> {format(new Date(chamado.criadoEm.seconds * 1000), "dd/MM/yyyy HH:mm")}
                </span>

               
                {chamado.resolvidoEm && (
                  <div className="flex flex-col items-start">
                    <span className=" flex flex-1/2 text-sm text-zinc-400 mt-2">
                    Resolvido em:{" "}
                    {format(new Date(chamado.resolvidoEm), "dd/MM/yyyy HH:mm")}
                    </span>
                    <span className="text-sm text-zinc-400">
                      Resolvido por: {userName}
                    </span>
                  </div>
                )}
               

                {!chamado.resolvido && (
                  <Button
                    className="hover:bg-zinc-200 transition-colors duration-200 mt-2"
                    onClick={() => marcarComoResolvido(chamado.id)}
                  >
                    <Toggle aria-label="Toggle" className="hover:bg-zinc-500">
                      <BookmarkCheck className="h-4 w-4 mr-2" />
                      Marcar como resolvido
                    </Toggle>
                  </Button>
                )}
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
