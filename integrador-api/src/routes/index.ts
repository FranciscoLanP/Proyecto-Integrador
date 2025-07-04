import { Router } from "express";
import barrioRoutes from "./barrioRoutes";
import marcaVehiculosRoutes from "./marcaVehiculosRoutes";
import inventarioRoutes from "./inventarioRoutes";
import coloresDatosRoutes from "./coloresDatosRoutes";
import distritoRoutes from "./distritoRoutes";
import empleadoInformacionRoutes from "./empleadoInformacionRoutes";
import facturaRoutes from "./facturaRoutes";
import garantiaRoutes from "./garantiaRoutes";
import inspeccionVehiculoRoutes from "./inspeccionVehiculoRoutes";
import metodoPagoRoutes from "./metodoPagoRoutes";
import modelosDatosRoutes from "./modelosDatosRoutes";
import municipioRoutes from "./municipioRoutes";
import clienesRoutes from "./clienetRoutes";
import piezaInventarioRoutes from "./piezaInventarioRoutes";
import provinciaRoutes from "./provinciaRoutes";
import recepcionVehiculoRoutes from "./recepcionVehiculoRoutes";
import reciboVehiculoRoutes from "./reciboVehiculoRoutes";
import reparacionVehiculoRoutes from "./reparacionVehiculoRoutes";
import sectorRoutes from "./sectorRoutes";
import suplidorPiezaRoutes from "./suplidorPiezaRoutes";
import suplidorPiezaRelacionRoutes from "./suplidorPiezaRelacionRoutes";
import tipoEmpleadoRoutes from "./tipoEmpleadoRoutes";
import usuariosRoutes from "./usuariosRoutes";
import vehiculoDatosRoutes from "./vehiculoDatosRoutes";
import tipoPiezaRoutes from "./tipoPiezaRoutes";
import tipoPagosRoutes from "./tipoPagosRoutes";
import authRoutes from "./authRoutes";

const router = Router();

router.use(barrioRoutes);
router.use(coloresDatosRoutes);
router.use(distritoRoutes);
router.use(empleadoInformacionRoutes);
router.use(facturaRoutes);
router.use(garantiaRoutes);
router.use(inspeccionVehiculoRoutes);
router.use(inventarioRoutes);
router.use(marcaVehiculosRoutes);
router.use(metodoPagoRoutes);
router.use(modelosDatosRoutes);
router.use(municipioRoutes);
router.use(clienesRoutes);
router.use(piezaInventarioRoutes);
router.use(provinciaRoutes);
router.use(recepcionVehiculoRoutes);
router.use(reciboVehiculoRoutes);
router.use(reparacionVehiculoRoutes);
router.use(sectorRoutes);
router.use(suplidorPiezaRelacionRoutes);
router.use(suplidorPiezaRoutes);
router.use(tipoEmpleadoRoutes);
router.use(tipoPagosRoutes);
router.use(tipoPiezaRoutes);
router.use(usuariosRoutes);
router.use(vehiculoDatosRoutes);
router.use('/auth', authRoutes);

export default router;