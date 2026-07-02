# MEDIX

Sistema hospitalario para gestion de pacientes, citas, admision, atenciones medicas, usuarios, reportes y trazabilidad.

## Ejecutar localmente

```powershell
docker compose up -d --build
docker compose exec backend python -m app.scripts.init_db
```

Abrir:

```text
http://127.0.0.1:5173
```

## Accesos demo

```text
Administrador: DNI 12345678 / admin123
Medico: DNI 11112222 / doctor123
Recepcion: DNI 22223333 / recep123
```

## Seguridad implementada

- Acceso por DNI y contrasena.
- Roles separados para administrador, recepcionista y medico.
- Validacion de permisos en backend.
- Limite de intentos fallidos de login.
- Mensajes de error claros sin exponer detalles internos.
- Limpieza de sesion ante tokens invalidos.
- Cabeceras de seguridad HTTP.
- Configuracion por variables de entorno para despliegue.

## Despliegue publico

Revisa [DEPLOYMENT.md](DEPLOYMENT.md) para publicar backend, frontend, PostgreSQL y Redis en un proveedor cloud.
