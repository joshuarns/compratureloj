import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSEO } from "../../hooks/useSEO";

import MisRelojes        from "./MisRelojes";
import MisCompras        from "./MisCompras";
import MisResenas        from "./MisResenas";
import AdminResenas      from "./AdminResenas";
import RelojesPendientes from "./RelojesPendientes";
import MiCuenta          from "./MiCuenta";

import './Dashboard.css';
import '../../App.css';

const TABS = [
    { id: 'relojes',        label: 'Mis relojes',         soloAdmin: false },
    { id: 'compras',        label: 'Mis compras',          soloAdmin: false },
    { id: 'cuenta',         label: 'Mi cuenta',            soloAdmin: false },
    { id: 'resenas',        label: 'Reseñas',              soloAdmin: false },
    { id: 'admin-resenas',  label: 'Gestionar reseñas',    soloAdmin: true  },
    { id: 'pendientes',     label: 'Relojes pendientes',   soloAdmin: true  },
];

export default function Dashboard() {
    const { usuario, logout } = useAuth();
    const navigate            = useNavigate();
    const [searchParams]      = useSearchParams();

    const [tabActivo, setTabActivo] = useState(searchParams.get("tab") || "relojes");

    useSEO({ titulo: "Mi Dashboard" });

    useEffect(() => {
        if (!usuario) navigate("/login");
    }, [usuario, navigate]);

    if (!usuario) return null;

    const esAdmin   = usuario.roles?.includes('administrator');
    const tabsVis   = TABS.filter(t => !t.soloAdmin || esAdmin);

    const handleLogout = () => { logout(); navigate("/"); };

    return (
        <>
            <div className="container-fluid bannerSingle">
                <div className="container d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="mb-1">Mi Dashboard</h1>
                        <p className="mb-0">Bienvenido, {usuario.nombre}</p>
                    </div>
                    <button className="btnLogout" onClick={handleLogout}>Cerrar sesión</button>
                </div>
            </div>

            <div className="dashboardContent">
                <div className="container">

                    <div className="dashboardTabs">
                        {tabsVis.map(t => (
                            <button
                                key={t.id}
                                className={`dashboardTab${tabActivo === t.id ? " active" : ""}`}
                                onClick={() => setTabActivo(t.id)}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {tabActivo === "relojes" && (
                        <div className="d-flex justify-content-end mb-4">
                            <Link to="/vender-reloj" className="btnNuevoReloj">+ Subir reloj</Link>
                        </div>
                    )}

                    {tabActivo === "relojes"       && <MisRelojes        usuario={usuario} />}
                    {tabActivo === "compras"        && <MisCompras        usuario={usuario} />}
                    {tabActivo === "cuenta"         && <MiCuenta          usuario={usuario} />}
                    {tabActivo === "resenas"        && <MisResenas        usuario={usuario} />}
                    {tabActivo === "admin-resenas"  && esAdmin && <AdminResenas />}
                    {tabActivo === "pendientes"     && esAdmin && <RelojesPendientes />}

                </div>
            </div>
        </>
    );
}
