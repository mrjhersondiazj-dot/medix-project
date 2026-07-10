"""EXPOSICION MEDIX
Archivo: requisito_no_funcional_base_modelos_orm.py
Proposito: Base ORM: clase base para todos los modelos SQLAlchemy.
Nota: los comentarios explican el codigo para sustentacion; no cambian la logica.
"""

# Explicacion: Importa librerias o modulos usados por este archivo.
from sqlalchemy.orm import DeclarativeBase


# Explicacion: Define una clase que representa datos, configuracion o reglas del sistema.
class Base(DeclarativeBase):
    pass
