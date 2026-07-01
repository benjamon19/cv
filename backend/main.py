"""
Creador de CV — FastAPI backend
Receives CV data as JSON, converts it to RenderCV YAML, generates a PDF
(and optionally converts it to PNG), and streams the file back to the client.
"""

import io
import logging
import os
import re
import subprocess
import sys
import tempfile
from datetime import date as Date
from typing import Annotated, Literal

import phonenumbers
import yaml
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import unicodedata
import urllib.parse
from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    HttpUrl,
    TypeAdapter,
    ValidationInfo,
    field_validator,
    model_validator,
)
from pydantic import ValidationError as PydanticValidationError

logger = logging.getLogger("cv_backend")

# ────────────────────────────────────────────────────────────────────────────────
# Shared validation helpers
# ────────────────────────────────────────────────────────────────────────────────

_CONTROL_CHARS_RE = re.compile(r"[\x00-\x1f\x7f]")


def _sanitize_text(v: str) -> str:
    return unicodedata.normalize("NFC", _CONTROL_CHARS_RE.sub("", v)).strip()


def _sanitize_payload(data):
    if isinstance(data, dict):
        return {k: _sanitize_payload(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [_sanitize_payload(item) for item in data]
    elif isinstance(data, str):
        return _sanitize_text(data)
    return data


# Nombre de usuario o URL de perfil "razonable": empieza con una letra/dígito
# (incluye letras con tilde, ñ, etc.) y no tiene espacios ni caracteres de
# control. Permite los caracteres típicos de una URL (incluyendo "/" final,
# query strings y nombres con acentos sin codificar).
_PROFILE_FIELD_RE = re.compile(r"^\w[\w.~:/?#\[\]@!$&'()*+,;=%-]*$")


def _require_non_empty(v: str, info: ValidationInfo) -> str:
    if not v or not v.strip():
        raise ValueError(f"El campo «{info.field_name}» no puede estar vacío.")
    return v.strip()


def _validate_profile_field(v: str, info: ValidationInfo) -> str:
    value = v.strip()
    if not value:
        return value
    if not _PROFILE_FIELD_RE.match(value):
        raise ValueError(
            f"El campo «{info.field_name}» no tiene un formato válido. "
            "Ingresá una URL o nombre de usuario sin espacios ni caracteres especiales."
        )
    return value


def _parse_strict_date(date_str: str) -> Date:
    """Parse YYYY-MM-DD, YYYY-MM, or YYYY — mirrors RenderCV's own date parsing."""
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", date_str):
        return Date.fromisoformat(date_str)
    if re.fullmatch(r"\d{4}-\d{2}", date_str):
        return Date.fromisoformat(f"{date_str}-01")
    if re.fullmatch(r"\d{4}", date_str):
        return Date.fromisoformat(f"{date_str}-01-01")
    raise ValueError("Formato de fecha inválido.")


def _validate_exact_date_field(v: str, field_label: str) -> str:
    value = v.strip()
    if not value:
        raise ValueError(f"La fecha de {field_label} es obligatoria.")
    try:
        _parse_strict_date(value)
    except ValueError:
        raise ValueError(f"La fecha de {field_label} debe tener el formato YYYY-MM-DD, YYYY-MM o YYYY.")
    return value


# RenderCV valida "website" con pydantic.HttpUrl — replicamos la misma regla
# acá para que el error salga como 422 de este campo, no como un 500/422
# genérico del subprocess de RenderCV.
_website_adapter = TypeAdapter(HttpUrl)


def _validate_website(v: str) -> str:
    value = v.strip()
    if not value:
        return value
    if not _PROFILE_FIELD_RE.match(value):
        raise ValueError(
            "El campo «website» no tiene un formato válido. "
            "Ingresá una URL sin espacios ni caracteres especiales."
        )
    candidate = value if re.match(r"^https?://", value, re.IGNORECASE) else f"https://{value}"
    try:
        _website_adapter.validate_python(candidate)
    except PydanticValidationError:
        raise ValueError(
            "El campo «website» no es una URL válida. Ejemplo: https://tuweb.com"
        )
    return value


# Límites generosos pero finitos: evitan que un payload gigante (accidental o
# no) genere un YAML/PDF desproporcionado o consuma memoria de más.
HighlightStr = Annotated[str, Field(max_length=500)]


# ────────────────────────────────────────────────────────────────────────────────
# Pydantic models — mirror the TypeScript CVData shape
# ────────────────────────────────────────────────────────────────────────────────

class PersonalData(BaseModel):
    name: str = Field(max_length=200)
    email: EmailStr
    phone: str = Field(max_length=40)
    location: str = Field(max_length=200)
    website: str = Field(default="", max_length=300)
    linkedin: str = Field(default="", max_length=300)
    github: str = Field(default="", max_length=300)

    @field_validator("name", "location")
    @classmethod
    def validate_required_text(cls, v: str, info: ValidationInfo) -> str:
        return _require_non_empty(v, info)

    @field_validator("name")
    @classmethod
    def clean_name_escapes(cls, v: str) -> str:
        return v.replace("\\", "").replace('"', "")

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        phone_str = v.strip()
        try:
            parsed = phonenumbers.parse(phone_str, None)
            if not phonenumbers.is_valid_number(parsed):
                raise ValueError("El número de teléfono no es válido.")
        except Exception:
            raise ValueError(
                "El número de teléfono no es válido. Debe incluir el código de país, por ejemplo: +56 9 1234 5678"
            )
        return v

    @field_validator("website")
    @classmethod
    def validate_website(cls, v: str) -> str:
        return _validate_website(v)

    @field_validator("linkedin", "github")
    @classmethod
    def validate_profile_field(cls, v: str, info: ValidationInfo) -> str:
        return _validate_profile_field(v, info)


class Experience(BaseModel):
    id: str
    company: str = Field(max_length=200)
    position: str = Field(max_length=200)
    startDate: str = Field(max_length=20)
    current: bool = False
    endDate: str = Field(max_length=20)
    location: str = Field(max_length=200)
    highlights: list[HighlightStr] = Field(default_factory=list, max_length=30)

    @field_validator("company", "position", "location")
    @classmethod
    def validate_required_text(cls, v: str, info: ValidationInfo) -> str:
        return _require_non_empty(v, info)

    @field_validator("startDate")
    @classmethod
    def validate_start_date(cls, v: str) -> str:
        return _validate_exact_date_field(v, "inicio")

    @field_validator("endDate")
    @classmethod
    def validate_end_date(cls, v: str, info: ValidationInfo) -> str:
        value = v.strip()
        if info.data.get("current"):
            return value
        if not value:
            raise ValueError('La fecha de fin es obligatoria (o marcá "posición actual").')
        try:
            end_obj = _parse_strict_date(value)
        except ValueError:
            raise ValueError("La fecha de fin debe tener el formato YYYY-MM-DD, YYYY-MM o YYYY.")

        start_raw = info.data.get("startDate")
        if start_raw:
            try:
                start_obj = _parse_strict_date(start_raw.strip())
            except ValueError:
                return value  # el propio startDate ya reporta su error
            if start_obj > end_obj:
                raise ValueError("La fecha de fin no puede ser anterior a la fecha de inicio.")
        return value


class Education(BaseModel):
    id: str
    institution: str = Field(max_length=200)
    degree: str = Field(max_length=200)
    area: str = Field(max_length=200)
    startDate: str = Field(max_length=20)
    endDate: str = Field(max_length=20)
    gpa: str = Field(default="", max_length=30)

    @field_validator("institution", "degree", "area")
    @classmethod
    def validate_required_text(cls, v: str, info: ValidationInfo) -> str:
        return _require_non_empty(v, info)

    @field_validator("startDate")
    @classmethod
    def validate_start_date(cls, v: str) -> str:
        return _validate_exact_date_field(v, "inicio")

    @field_validator("endDate")
    @classmethod
    def validate_end_date(cls, v: str, info: ValidationInfo) -> str:
        value = v.strip()
        if not value:
            return value  # estudios en curso: opcional

        try:
            end_obj = _parse_strict_date(value)
        except ValueError:
            raise ValueError("La fecha de fin debe tener el formato YYYY-MM-DD, YYYY-MM o YYYY.")

        start_raw = info.data.get("startDate")
        if start_raw:
            try:
                start_obj = _parse_strict_date(start_raw.strip())
            except ValueError:
                return value  # el propio startDate ya reporta su error
            if start_obj > end_obj:
                raise ValueError("La fecha de fin no puede ser anterior a la fecha de inicio.")
        return value


class SkillGroup(BaseModel):
    label: str = Field(max_length=100)
    details: str = Field(max_length=500)

    @field_validator("label", "details")
    @classmethod
    def validate_required_text(cls, v: str, info: ValidationInfo) -> str:
        return _require_non_empty(v, info)


class Project(BaseModel):
    id: str
    name: str = Field(max_length=200)
    url: str = Field(default="", max_length=300)
    date: str = Field(default="", max_length=30)
    highlights: list[HighlightStr] = Field(default_factory=list, max_length=30)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str, info: ValidationInfo) -> str:
        return _require_non_empty(v, info)


class Certification(BaseModel):
    id: str
    name: str = Field(max_length=200)
    institution: str = Field(default="", max_length=200)
    date: str = Field(default="", max_length=30)
    url: str = Field(default="", max_length=300)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str, info: ValidationInfo) -> str:
        return _require_non_empty(v, info)


class VolunteerEntry(BaseModel):
    id: str
    organization: str = Field(max_length=200)
    position: str = Field(default="", max_length=200)
    startDate: str = Field(default="", max_length=30)
    endDate: str = Field(default="", max_length=30)
    current: bool = False
    highlights: list[HighlightStr] = Field(default_factory=list, max_length=30)

    @field_validator("organization")
    @classmethod
    def validate_organization(cls, v: str, info: ValidationInfo) -> str:
        return _require_non_empty(v, info)


class PublicationEntry(BaseModel):
    id: str
    title: str = Field(max_length=200)
    authors: str = Field(default="", max_length=200)
    date: str = Field(default="", max_length=30)
    journal: str = Field(default="", max_length=200)
    url: str = Field(default="", max_length=300)

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str, info: ValidationInfo) -> str:
        return _require_non_empty(v, info)


class TemplateSelection(BaseModel):
    theme: str = "classic"
    format: str = "pdf"


class CVRequest(BaseModel):
    personal: PersonalData
    summary: str = Field(max_length=4000)
    experience: list[Experience] = Field(max_length=40)
    education: list[Education] = Field(max_length=40)
    projects: list[Project] = Field(default_factory=list, max_length=40)
    certifications: list[Certification] = Field(default_factory=list, max_length=40)
    volunteer: list[VolunteerEntry] = Field(default_factory=list, max_length=40)
    publications: list[PublicationEntry] = Field(default_factory=list, max_length=40)
    skills: list[SkillGroup] = Field(max_length=40)
    template: TemplateSelection

    @model_validator(mode="before")
    @classmethod
    def sanitize_input(cls, data):
        return _sanitize_payload(data)


# ────────────────────────────────────────────────────────────────────────────────
# App setup
# ────────────────────────────────────────────────────────────────────────────────

app = FastAPI(title="Creador de CV API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    # Sin credenciales (cookies/auth): la API no las usa, y el spec de CORS no
    # permite combinar origin "*" con allow_credentials=True.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ────────────────────────────────────────────────────────────────────────────────
# Seguridad básica de transporte: headers estándar y límite de tamaño de
# request. No hay autenticación (es una herramienta interna para un grupo
# chico), pero esto evita los descuidos más baratos de explotar.
# ────────────────────────────────────────────────────────────────────────────────

MAX_REQUEST_BODY_BYTES = 300_000  # un CV en JSON no debería superar esto


@app.middleware("http")
async def enforce_request_size_limit(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length is not None:
        try:
            if int(content_length) > MAX_REQUEST_BODY_BYTES:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "La solicitud es demasiado grande."},
                )
        except ValueError:
            pass
    return await call_next(request)


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    return response


# ────────────────────────────────────────────────────────────────────────────────
# Manejo global de errores — nunca devolver un traceback al cliente. Cualquier
# problema con los datos de entrada es un 422 con mensaje claro (con el campo
# exacto identificado, para que el frontend lo marque en el input
# correspondiente); el 500 queda reservado para errores reales de servidor
# (ver /generate-cv).
# ────────────────────────────────────────────────────────────────────────────────

def _format_validation_errors(errors: list[dict]) -> tuple[str, list[dict[str, str]]]:
    messages: list[str] = []
    field_errors: list[dict[str, str]] = []
    for error in errors:
        loc = [str(part) for part in error.get("loc", ()) if part != "body"]
        field = ".".join(loc)
        msg = error.get("msg", "Dato inválido.")
        if msg.startswith("Value error, "):
            msg = msg[len("Value error, "):]
        messages.append(f"{field}: {msg}" if field else msg)
        if field:
            field_errors.append({"field": field, "message": msg})
    detail = " | ".join(messages) if messages else "Los datos enviados no son válidos."
    return detail, field_errors


@app.exception_handler(RequestValidationError)
async def handle_request_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    logger.warning("Datos de entrada inválidos en %s: %s", request.url.path, exc.errors())
    detail, field_errors = _format_validation_errors(exc.errors())
    return JSONResponse(status_code=422, content={"detail": detail, "errors": field_errors})


@app.exception_handler(PydanticValidationError)
async def handle_pydantic_validation_error(request: Request, exc: PydanticValidationError) -> JSONResponse:
    logger.warning("Error de validación en %s: %s", request.url.path, exc.errors())
    detail, field_errors = _format_validation_errors(exc.errors())
    return JSONResponse(status_code=422, content={"detail": detail, "errors": field_errors})


@app.exception_handler(Exception)
async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Error no controlado en %s", request.url.path, exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Ocurrió un error interno en el servidor. Intentá nuevamente más tarde."},
    )


# ────────────────────────────────────────────────────────────────────────────────
# YAML builder
# ────────────────────────────────────────────────────────────────────────────────

def _strip_username(url: str, domain: str) -> str:
    """Extract username from a profile URL or return as-is if already a username."""
    unquoted = urllib.parse.unquote(url)
    cleaned = unquoted.split("?")[0].split("#")[0]
    if domain in cleaned:
        username = cleaned.split(domain)[-1]
    else:
        username = cleaned
    username = username.strip().lstrip("@").rstrip("/")
    return _sanitize_text(username)


def build_rendercv_yaml(cv: CVRequest) -> dict:
    p = cv.personal

    cv_block: dict = {
        "name": p.name,
        "location": p.location,
        "email": p.email,
        "phone": p.phone,
    }

    if p.website:
        cv_block["website"] = p.website if p.website.startswith("http") else f"https://{p.website}"

    social = []
    if p.linkedin:
        social.append({"network": "LinkedIn", "username": _strip_username(p.linkedin, "linkedin.com/in/")})
    if p.github:
        social.append({"network": "GitHub", "username": _strip_username(p.github, "github.com/")})
    if social:
        cv_block["social_networks"] = social

    sections: dict = {}

    if cv.summary.strip():
        sections["summary"] = [cv.summary.strip()]

    if cv.experience:
        exp_list = []
        for e in cv.experience:
            entry = {
                "company": e.company,
                "position": e.position,
                "location": e.location,
                "start_date": e.startDate,
                "end_date": "present" if e.current else e.endDate,
                "highlights": [h for h in e.highlights if h.strip()],
            }
            exp_list.append(entry)
        sections["experience"] = exp_list

    if cv.education:
        edu_list = []
        for ed in cv.education:
            entry = {
                "institution": ed.institution,
                "area": ed.area,
                "degree": ed.degree,
                "start_date": ed.startDate,
            }
            # endDate vacío = estudios en curso: se omite y RenderCV lo trata
            # como "present" internamente.
            if ed.endDate.strip():
                entry["end_date"] = ed.endDate
            if ed.gpa.strip():
                entry["highlights"] = [f"GPA: {ed.gpa.strip()}"]
            edu_list.append(entry)
        sections["education"] = edu_list

    if cv.projects:
        project_list = []
        for p in cv.projects:
            if not p.name.strip():
                continue
            entry: dict = {"name": p.name.strip()}
            if p.url.strip():
                entry["url"] = p.url.strip() if p.url.startswith("http") else f"https://{p.url.strip()}"
            if p.date.strip():
                entry["date"] = p.date.strip()
            highlights = [h for h in p.highlights if h.strip()]
            if highlights:
                entry["highlights"] = highlights
            project_list.append(entry)
        if project_list:
            sections["projects"] = project_list

    if cv.certifications:
        cert_highlights = []
        for c in cv.certifications:
            if not c.name.strip():
                continue
            line = c.name.strip()
            if c.institution.strip():
                line += f" — {c.institution.strip()}"
            if c.date.strip():
                line += f" ({c.date.strip()})"
            if c.url.strip():
                url = c.url.strip() if c.url.startswith("http") else f"https://{c.url.strip()}"
                line += f" | {url}"
            cert_highlights.append(line)
        if cert_highlights:
            sections["certifications"] = [{"label": "Certificaciones", "details": " · ".join(cert_highlights)}]

    if cv.volunteer:
        vol_list = []
        for v in cv.volunteer:
            if not v.organization.strip():
                continue
            entry = {
                "company": v.organization.strip(),
                "position": v.position.strip() if v.position.strip() else "Voluntario/a",
                "start_date": v.startDate.strip() if v.startDate.strip() else "2020",
                "end_date": "present" if v.current else (v.endDate.strip() if v.endDate.strip() else "present"),
            }
            highlights = [h for h in v.highlights if h.strip()]
            if highlights:
                entry["highlights"] = highlights
            vol_list.append(entry)
        if vol_list:
            sections["extracurricular_activities"] = vol_list

    if cv.publications:
        pub_list = []
        for p in cv.publications:
            if not p.title.strip():
                continue
            entry: dict = {"title": p.title.strip()}
            authors = p.authors.strip()
            journal = p.journal.strip()
            date = p.date.strip()
            url = p.url.strip()
            line_parts = []
            if authors:
                line_parts.append(authors)
            if journal:
                line_parts.append(journal)
            if date:
                line_parts.append(date)
            if url:
                link = url if url.startswith("http") else f"https://{url}"
                line_parts.append(link)
            if line_parts:
                entry["highlights"] = [" | ".join(line_parts)]
            pub_list.append(entry)
        if pub_list:
            sections["publications"] = pub_list

    if cv.skills:
        skill_list = [
            {"label": s.label, "details": s.details}
            for s in cv.skills
            if s.label.strip() and s.details.strip()
        ]
        if skill_list:
            sections["skills"] = skill_list

    cv_block["sections"] = sections

    return {
        "cv": cv_block,
        "design": {"theme": cv.template.theme},
        "settings": {
            "render_command": {
                "typst_path": "OUTPUT_FOLDER/cv.typ",
                "pdf_path": "OUTPUT_FOLDER/cv.pdf",
                "markdown_path": "OUTPUT_FOLDER/cv.md",
                "html_path": "OUTPUT_FOLDER/cv.html",
                "png_path": "OUTPUT_FOLDER/cv.png",
            }
        },
    }


# ────────────────────────────────────────────────────────────────────────────────
# Endpoints
# ────────────────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


_BOX_DRAWING_CHARS = "─━│┃┌┐└┘├┤┬┴┼╭╮╰╯═║╔╗╚╝╠╣╦╩╬"


def _simplify_rendercv_output(output: str) -> str:
    """Strip RenderCV's rich table/panel decoration down to a short plain-text message."""
    lines = []
    for raw_line in output.splitlines():
        stripped = raw_line.strip()
        if not stripped:
            continue
        if all(ch in _BOX_DRAWING_CHARS + " " for ch in stripped):
            continue
        cleaned = stripped.strip(_BOX_DRAWING_CHARS + " ")
        cleaned = re.sub(r"\s{2,}", " — ", cleaned)
        if cleaned:
            lines.append(cleaned)
    message = " | ".join(lines)
    return message[:400] if message else "Los datos ingresados no son válidos para generar el CV."


@app.post("/generate-cv")
async def generate_cv(cv: CVRequest):
    with tempfile.TemporaryDirectory() as tmpdir:
        # 1. Write YAML
        try:
            yaml_path = os.path.join(tmpdir, "cv.yaml")
            cv_data = build_rendercv_yaml(cv)

            with open(yaml_path, "w", encoding="utf-8") as f:
                yaml.dump(cv_data, f, allow_unicode=True, default_flow_style=False, sort_keys=False)
        except Exception:
            logger.exception("Error al construir o escribir el archivo YAML.")
            raise HTTPException(
                status_code=422,
                detail="No pudimos generar el CV con los datos ingresados. Revisá que no haya caracteres extraños e intentá de nuevo.",
            )

        # 2. Run RenderCV
        try:
            result = subprocess.run(
                [sys.executable, "-m", "rendercv", "render", yaml_path, "--output-folder", "output"],
                capture_output=True,
                text=True,
                cwd=tmpdir,
                timeout=45,
            )
        except subprocess.TimeoutExpired:
            logger.error("RenderCV superó el tiempo límite de generación (45s).")
            raise HTTPException(
                status_code=504,
                detail="La generación del CV está tardando demasiado. Intentá nuevamente.",
            )

        if result.returncode != 0:
            combined_output = f"{result.stdout}\n{result.stderr}".strip()
            logger.error("RenderCV terminó con código %s:\n%s", result.returncode, combined_output)

            raise HTTPException(
                status_code=422,
                detail=_simplify_rendercv_output(combined_output),
            )

        # 3. Locate generated PDF
        output_dir = os.path.join(tmpdir, "output")
        if not os.path.isdir(output_dir):
            logger.error("RenderCV no creó la carpeta de salida esperada en %s", output_dir)
            raise HTTPException(
                status_code=500,
                detail="No se pudo generar el CV: no se creó la carpeta de salida.",
            )

        pdf_path = os.path.join(output_dir, "cv.pdf")
        if not os.path.isfile(pdf_path):
            logger.error("RenderCV no produjo ningún PDF en %s", pdf_path)
            raise HTTPException(
                status_code=500,
                detail="No se pudo generar el CV: no se produjo ningún archivo PDF.",
            )

        # 4a. PNG output — convert PDF → image
        if cv.template.format == "png":
            try:
                from pdf2image import convert_from_path  # type: ignore[import-untyped]
                from PIL import Image  # type: ignore[import-untyped]

                images = convert_from_path(pdf_path, dpi=200)

                img_buffer = io.BytesIO()
                if len(images) == 1:
                    images[0].save(img_buffer, format="PNG", optimize=True)
                else:
                    # Stitch multi-page PDF vertically into one image
                    total_height = sum(img.height for img in images)
                    max_width = max(img.width for img in images)
                    canvas = Image.new("RGB", (max_width, total_height), color="white")
                    y_offset = 0
                    for img in images:
                        canvas.paste(img, (0, y_offset))
                        y_offset += img.height
                    canvas.save(img_buffer, format="PNG", optimize=True)

                img_buffer.seek(0)
                return StreamingResponse(
                    img_buffer,
                    media_type="image/png",
                    headers={"Content-Disposition": 'attachment; filename="cv.png"'},
                )

            except ImportError:
                logger.error("pdf2image/Pillow no está instalado en el servidor.")
                raise HTTPException(
                    status_code=500,
                    detail="No se pudo generar el PNG: falta una dependencia del servidor.",
                )
            except Exception:
                logger.exception("Error al convertir PDF a PNG.")
                raise HTTPException(
                    status_code=422,
                    detail="No pudimos generar la imagen PNG del CV. Probá con el formato PDF o intentá de nuevo.",
                )

        # 4b. PDF output — stream directly
        with open(pdf_path, "rb") as f:
            pdf_content = f.read()

        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="cv.pdf"'},
        )
