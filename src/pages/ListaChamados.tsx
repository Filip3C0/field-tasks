import { useEffect, useState } from "react";
import { db } from "../db/firabase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Card, CardContent } from "../components/ui/card";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { Toggle } from "../components/ui/toggle";
import { BookmarkCheck } from "lucide-react";
import { Button } from "../components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";
import { signOut } from "firebase/auth";
import { auth } from "../db/firabase";
import { useNavigate } from "react-router-dom";



interface Chamado {
  id: string;
  chamado: string;
  solicitante: string;
  descricao: string;
  setor: string;
  sala?: string;
  predio?: string;
  resolvido?: boolean;
  resolvidoEm?: string; // data da resolução (em formato ISO)
}

export default function ListaChamados() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const [predioSelecionado, setPredioSelecionado] = useState("");
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [carregando, setCarregando] = useState(false);

  const predios = ["Adm", "Cível", "Palácio", "Criminal", "Cidadania"];

  const buscarChamados = async (predio: string) => {
    setCarregando(true);
    try {
      const chamadosRef = collection(db, "chamados");
      const q = query(chamadosRef, where("predio", "==", predio));
      const snapshot = await getDocs(q);
      const resultado: Chamado[] = [];
      snapshot.forEach((doc) => resultado.push({ id: doc.id, ...doc.data() } as Chamado));
      setChamados(resultado);
    } catch (error) {
      console.error("Erro ao buscar chamados:", error);
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

      setChamados((prevChamados) =>
        prevChamados.map((c) =>
          c.id === id ? { ...c, resolvido: true, resolvidoEm: dataAtual } : c
        )
      );

      toast.success("Chamado resolvido", {
        description: "O chamado foi marcado como resolvido com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao marcar como resolvido:", error);
      toast.error("Erro ao marcar como resolvido", {
        description: "Não foi possível marcar como resolvido.",
      });
    }
  };



  useEffect(() => {
    if (predioSelecionado) {
      buscarChamados(predioSelecionado);
    } else {
      setChamados([]);
    }
  }, [predioSelecionado]);

  return (
    <div className="flex flex-col items-center h-screen w-full bg-zinc-700 text-white">
      <div className="flex flex-col w-[350px] max-w-3xl p-6 mt-8">
        
        <h2 className="!text-2xl font-bold !gap-1 !pt-5">Chamados por Prédio</h2>

        <div className="!mb-6 flex flex-col items-start gap-6">
          
          <Label className="mb-1 text-sm">Selecione o prédio</Label>
          <Select
            value={predioSelecionado}
            onValueChange={(value) => setPredioSelecionado(value)}
          >
            <Button
          onClick={handleLogout}
          variant="secondary"
          className="!w-[60px] !rounded-sm !bg-red-600 !text-white hover:underline"
        >
          Sair
        </Button>
            <SelectTrigger
              className="w-[360px] !h-10 !pl-3 !border-1 !mb-5 !border-zinc-800 !text-zinc-300 !hover:border-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              <SelectValue placeholder="--Escolha um prédio--" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 text-white font-semibold">
              {predios.map((p) => (
                <SelectItem
                  key={p}
                  value={p}
                  className="pl-3 mb-1 rounded-none hover:bg-zinc-400 w-full h-7"
                >
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
            
          </Select>
          
        </div>
              
        {carregando && <p className="text-indigo-200">Carregando chamados...</p>}

        {!carregando && chamados.length === 0 && predioSelecionado && (
          <p className="text-zinc-200">Nenhum chamado encontrado.</p>
        )}
      </div>

      <div className="space-y-8 ">
        {chamados.map((chamado) => (
          <Card
            key={chamado.id}
            className={`flex flex-col !mb-3 items-start p-6 transition-opacity duration-300 ${chamado.resolvido ? "opacity-50" : "opacity-100"
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
                  <strong>Sala:</strong> {chamado.sala || " "}
                </span>

                {chamado.resolvidoEm && (
                  <span className="text-sm text-zinc-400 mt-2">
                    Resolvido em:{" "}
                    {format(new Date(chamado.resolvidoEm), "dd/MM/yyyy HH:mm")}
                  </span>
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



