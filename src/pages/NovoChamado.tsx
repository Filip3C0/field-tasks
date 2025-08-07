import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "../db/firabase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import {
  Card,
  CardHeader,
  CardContent,
} from "../components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/ui/select";
import { signOut } from "firebase/auth";
import { auth } from "../db/firabase";
import { useNavigate } from "react-router-dom";



const chamadoSchema = z.object({
  predio: z.string().min(1, "Selecione o prédio"),
  chamado: z.string().min(1, "Chamado é obrigatório"),
  solicitante: z.string().min(1, "Solicitante é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  setor: z.string().min(1, "Setor é obrigatório"),
  sala: z.string().optional(),
});


type ChamadoFormData = z.infer<typeof chamadoSchema>;



export default function NovoChamado() {
  const navigate = useNavigate(); // ← movido para dentro do componente

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/"); // ← agora funciona corretamente
  };
  const form = useForm<ChamadoFormData>({
    resolver: zodResolver(chamadoSchema),
    defaultValues: {
      predio: "",
      chamado: "",
      solicitante: "",
      descricao: "",
      setor: "",
      sala: "",
    },
  });

  const onSubmit = async (data: ChamadoFormData) => {
    try {
      await addDoc(collection(db, "chamados"), {
        ...data,
        criadoEm: Timestamp.now(),
      });
      toast.success("Chamado enviado com sucesso!");
      form.reset();
    } catch (error) {
      toast.error("Erro ao enviar chamado.");
    }
  };

  const predios = ["Adm", "Cível", "Palácio", "Criminal", "Cidadania"];

  return (
    <div className="min-h-screen flex items-center justify-center !bg-gradient-to-b !from-[#0a0a23] !to-[#1a1a2e] text-zinc-200 ">
      <Card className="w-full max-w-3xl rounded-2xl bg-cyan-0 !border-1 !border-cyan-500 !shadow-cyan-500 !shadow-xl/50 inset-shadow-sm inset-shadow-cyan-500 ">
        <Toaster />
        <CardHeader className=" !pl-3 !pt-3 mb-6">
          <span className="text-3xl font-bold text-zinc-400">Reportar um chamado</span>
          <span className="text-sm text-zinc-400">
            Preencha o formulário abaixo para registrar um novo chamado.
          </span>
        </CardHeader>

        <CardContent>
          <Form {...form} >
            <form onSubmit={form.handleSubmit(onSubmit)} className="  flex flex-col !pl-3 !pr-3 !pb-4 text-zinc-300 gap-3 ">
              <div className="flex flex-col md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="predio"
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-between flex-1">
                      <FormLabel className="after:content-['*'] after:text-red-400">
                        Prédio
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger
                            className="cursor-pointer w-[360px] h-11 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !rounded-2xl !text-zinc-400
          hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3"
                          >
                            <SelectValue placeholder="Selecione o prédio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-900 text-zinc-200 h-auto !shadow-cyan-500 !shadow-xl/50 !p-2 inset-shadow-sm inset-shadow-cyan-500">
                          {predios.map((p) => (
                            <SelectItem key={p} value={p} className="!pl-3 !mb-1 rounded-none hover:bg-zinc-400 !w-full !h-7">
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="setor"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className=" after:text-red-400 after:content-['*']">Setor</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o setor"
                          className="cursor-pointer w-[360px] h-11 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !rounded-2xl !text-zinc-100
          hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="solicitante"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className=" after:text-red-400 after:content-['*']">Solicitante</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nome do solicitante"
                          className="cursor-pointer w-[360px] h-11 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !rounded-2xl !text-zinc-100
          hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sala"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Sala</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: 204"
                          className="cursor-pointer w-[360px] h-11 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !rounded-2xl !text-zinc-100
          hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3"                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <FormField
                  control={form.control}
                  name="chamado"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className=" after:text-red-400 after:content-['*']">Chamado</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Título do chamado"
                          className="cursor-pointer w-[360px] h-11 !mb-4 !bg-zinc-850 !border-1 !border-zinc-500 !rounded-2xl !text-zinc-100
          hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3"                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className=" after:text-red-400 after:content-['*']">Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Inclua todas as informações relevantes"
                          className="cursor-pointer w-[360px] h-11 !mb-4 !p-2 !bg-zinc-850 !border-1 !border-zinc-500 !rounded-2xl !text-zinc-100
          hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-500 !pl-3"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  onClick={() => form.reset()}
                  className="!bg-red-300 !rounded-2xl !text-zinc-900 w-[100px] !hover:!bg-red-40"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  className=" !mb-4 !bg-cyan-300 !rounded-2xl !text-black w-[100px] hover:underline"
                >
                  Enviar
                </Button>

              </div>
              <Button
                onClick={handleLogout}
                variant="secondary"
                className="!bg-red-400 !rounded-sm !text-white hover:underline"
              >
                Sair
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div >
  );
}
