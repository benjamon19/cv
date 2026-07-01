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
import tempfile
from datetime import date as Date

import phonenumbers
import yaml
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ValidationInfo,
    field_validator,
    model_validator,
)
from pydantic import ValidationError as PydanticValidationError

logger = logging.getLogger("cv_backend")

# ────────────────────────────────────────────────────────────────────────────────
# Shared validation helpers
# ────────────────────────────────────────────────────────────────────────────────

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


# ────────────────────────────────────────────────────────────────────────────────
# Pydantic models — mirror the TypeScript CVData shape
# ────────────────────────────────────────────────────────────────────────────────

class PersonalData(BaseModel):
    name: str
    email: EmailStr
    phone: str
    location: str
    website: str = ""
    linkedin: str = ""
    github: str = ""

    @field_validator("name", "location")
    @classmethod
    def validate_required_text(cls, v: str, info: ValidationInfo) -> str:
        return _require_non_empty(v, info)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        phone_str = v.strip()
        try:
            parsed = phonenumbers.parse(phone_str, "CL")
            if not phonenumbers.is_valid_number(parsed):
                raise ValueError("El número de teléfono no es válido.")
        except Exception:
            raise ValueError(
                "El número de teléfono no es válido. Debe incluir el código de país, por ejemplo: +56 9 1234 5678"
            )
        return v

    @field_validator("website", "linkedin", "github")
    @classmethod
    def validate_profile_field(cls, v: str, info: ValidationInfo) -> str:
        return _validate_profile_field(v, info)


class Experience(BaseModel):
    id: str
    company: str
    position: str
    startDate: str
    endDate: str
    current: bool = False
    location: str
    highlights: list[str] = Field(default_factory=list)

    @field_validator("company", "position", "location")
    @classmethod
    def validate_required_text(cls, v: str, info: ValidationInfo) -> str:
        return _require_non_empty(v, info)

    @model_validator(mode="after")
    def validate_dates(self) -> "Experience":
        start = self.startDate.strip()
        if not start:
            raise ValueError("La fecha de inicio de la experiencia es obligatoria.")
        try:
            start_obj = _parse_strict_date(start)
        except ValueError:
            raise ValueError(
                "La fecha de inicio de la experiencia debe tener el formato YYYY-MM-DD, YYYY-MM o YYYY."
            )

        if self.current:
            return self

        end = self.endDate.strip()
        if not end:
            raise ValueError(
                'La fecha de fin de la experiencia es obligatoria (o marcá "posición actual").'
            )
        try:
            end_obj = _parse_strict_date(end)
        except ValueError:
            raise ValueError(
                "La fecha de fin de la experiencia debe tener el formato YYYY-MM-DD, YYYY-MM o YYYY."
            )

        if start_obj > end_obj:
            raise ValueError(
                "La fecha de inicio de la experiencia no puede ser posterior a la fecha de fin."
            )

        return self


class Education(BaseModel):
    id: str
    institution: str
    degree: str
    area: str
    startDate: str
    endDate: str
    gpa: str = ""

    @field_validator("institution", "degree", "area")
    @classmethod
    def validate_required_text(cls, v: str, info: ValidationInfo) -> str:
        return _require_non_empty(v, info)

    @model_validator(mode="after")
    def validate_dates(self) -> "Education":
        start = self.startDate.strip()
        if not start:
            raise ValueError("La fecha de inicio de la educación es obligatoria.")
        try:
            start_obj = _parse_strict_date(start)
        except ValueError:
            raise ValueError(
                "La fecha de inicio de la educación debe tener el formato YYYY-MM-DD, YYYY-MM o YYYY."
            )

        # endDate es opcional: estudios en curso.
        end = self.endDate.strip()
        if not end:
            return self
        try:
            end_obj = _parse_strict_date(end)
        except ValueError:
            raise ValueError(
                "La fecha de fin de la educación debe tener el formato YYYY-MM-DD, YYYY-MM o YYYY."
            )

        if start_obj > end_obj:
            raise ValueError(
                "La fecha de inicio de la educación no puede ser posterior a la fecha de fin."
            )

        return self


class SkillGroup(BaseModel):
    label: str
    details: str

    @field_validator("label", "details")
    @classmethod
    def validate_required_text(cls, v: str, info: ValidationInfo) -> str:
        return _require_non_empty(v, info)


class TemplateSelection(BaseModel):
    theme: str = "classic"
    format: str = "pdf"


class CVRequest(BaseModel):
    personal: PersonalData
    summary: str
    experience: list[Experience]
    education: list[Education]
    skills: list[SkillGroup]
    template: TemplateSelection


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
# Manejo global de errores — nunca devolver un traceback al cliente. Cualquier
# problema con los datos de entrada es un 422 con mensaje claro; el 500 queda
# reservado para errores reales de servidor (ver /generate-cv).
# ────────────────────────────────────────────────────────────────────────────────

def _format_validation_errors(errors: list[dict]) -> str:
    messages = []
    for error in errors:
        loc = [str(part) for part in error.get("loc", ()) if part != "body"]
        field = ".".join(loc)
        msg = error.get("msg", "Dato inválido.")
        if msg.startswith("Value error, "):
            msg = msg[len("Value error, "):]
        messages.append(f"{field}: {msg}" if field else msg)
    return " | ".join(messages) if messages else "Los datos enviados no son válidos."


@app.exception_handler(RequestValidationError)
async def handle_request_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
    logger.warning("Datos de entrada inválidos en %s: %s", request.url.path, exc.errors())
    return JSONResponse(status_code=422, content={"detail": _format_validation_errors(exc.errors())})


@app.exception_handler(PydanticValidationError)
async def handle_pydantic_validation_error(request: Request, exc: PydanticValidationError) -> JSONResponse:
    logger.warning("Error de validación en %s: %s", request.url.path, exc.errors())
    return JSONResponse(status_code=422, content={"detail": _format_validation_errors(exc.errors())})


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
    if domain in url:
        return url.split(domain)[-1].strip("/").split("?")[0]
    return url.strip("/")


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
    }


# ────────────────────────────────────────────────────────────────────────────────
# Endpoints
# ────────────────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


_BOX_DRAWING_CHARS = "─━│┃┌┐└┘├┤┬┴┼╭╮╰╯═║╔╗╚╝╠╣╦╩╬"
_RENDERCV_VALIDATION_MARKERS = ("validation error", "is not a valid", "there are validation errors")


def _looks_like_rendercv_validation_error(output: str) -> bool:
    lowered = output.lower()
    return any(marker in lowered for marker in _RENDERCV_VALIDATION_MARKERS)


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
        yaml_path = os.path.join(tmpdir, "cv.yaml")
        cv_data = build_rendercv_yaml(cv)

        with open(yaml_path, "w", encoding="utf-8") as f:
            yaml.dump(cv_data, f, allow_unicode=True, default_flow_style=False, sort_keys=False)

        # 2. Run RenderCV
        result = subprocess.run(
            ["rendercv", "render", yaml_path, "--output-folder", "output"],
            capture_output=True,
            text=True,
            cwd=tmpdir,
        )

        if result.returncode != 0:
            combined_output = f"{result.stdout}\n{result.stderr}".strip()
            logger.error("RenderCV terminó con código %s:\n%s", result.returncode, combined_output)

            if _looks_like_rendercv_validation_error(combined_output):
                # A pesar de la validación de Pydantic, RenderCV rechazó los datos:
                # tratamos esto como un problema de los datos del usuario (422), no
                # como un error de servidor.
                raise HTTPException(
                    status_code=422,
                    detail=_simplify_rendercv_output(combined_output),
                )

            raise HTTPException(
                status_code=500,
                detail="No se pudo generar el CV debido a un error interno del servidor.",
            )

        # 3. Locate generated PDF
        output_dir = os.path.join(tmpdir, "output")
        if not os.path.isdir(output_dir):
            logger.error("RenderCV no creó la carpeta de salida esperada en %s", output_dir)
            raise HTTPException(
                status_code=500,
                detail="No se pudo generar el CV: no se creó la carpeta de salida.",
            )

        pdf_files = [f for f in os.listdir(output_dir) if f.endswith(".pdf")]
        if not pdf_files:
            logger.error("RenderCV no produjo ningún PDF en %s", output_dir)
            raise HTTPException(
                status_code=500,
                detail="No se pudo generar el CV: no se produjo ningún archivo PDF.",
            )

        pdf_path = os.path.join(output_dir, pdf_files[0])

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

        # 4b. PDF output — stream directly
        with open(pdf_path, "rb") as f:
            pdf_content = f.read()

        return StreamingResponse(
            io.BytesIO(pdf_content),
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="cv.pdf"'},
        )
