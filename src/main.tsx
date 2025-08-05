// src/main.tsx
import ReactDOM from 'react-dom/client';
import NovoChamado from "./pages/NovoChamado.tsx"
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ListaChamados from './pages/ListaChamados.tsx';
import Login from './pages/Login.tsx';
import { useEffect, useState, type JSX } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./db/firabase";
import { Navigate } from "react-router-dom";
import Registro from './pages/Registro.tsx';

function RotaPrivada({ children }: { children: JSX.Element }) {
  const [logado, setLogado] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLogado(!!user);
    });
    return unsub;
  }, []);

  if (logado === null) return <p>Carregando...</p>;

  return logado ? children : <Navigate to="/login" />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>

      <Route path="/registro" element={<Registro />} />
      <Route path="/" element={<Login />} />
      <Route
        path="/novo-chamado"
        element={
          <RotaPrivada>
            <NovoChamado />
          </RotaPrivada>
        }
      />
      <Route
        path="/lista"
        element={
          <RotaPrivada>
            <ListaChamados />
          </RotaPrivada>
        }
      />

    </Routes>
  </BrowserRouter>
);
