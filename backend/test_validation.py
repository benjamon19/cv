import pytest
import subprocess
import tempfile
import os
import yaml
from fastapi.testclient import TestClient
from main import app, CVRequest, build_rendercv_yaml

client = TestClient(app)

# Session-scoped fixture to check if we can run a real RenderCV render
@pytest.fixture(scope="session")
def can_render():
    with tempfile.TemporaryDirectory() as tmpdir:
        dummy_cv = {
            "personal": {
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+56 9 1234 5678",
                "location": "Santiago, Chile",
            },
            "summary": "This is a brief summary for testing.",
            "experience": [],
            "education": [],
            "skills": [{"label": "Tech", "details": "Python, pytest"}],
            "template": {"theme": "classic", "format": "pdf"}
        }
        yaml_path = os.path.join(tmpdir, "cv.yaml")
        try:
            cv_obj = CVRequest(**dummy_cv)
            cv_data = build_rendercv_yaml(cv_obj)
            with open(yaml_path, "w", encoding="utf-8") as f:
                yaml.dump(cv_data, f, allow_unicode=True, default_flow_style=False, sort_keys=False)
            
            import sys
            result = subprocess.run(
                [sys.executable, "-m", "rendercv", "render", yaml_path, "--output-folder", "output"],
                capture_output=True,
                text=True,
                cwd=tmpdir,
                timeout=20,
            )
            return result.returncode == 0
        except Exception:
            return False


# BASE DATA FIXTURE
@pytest.fixture
def valid_payload():
    return {
        "personal": {
            "name": "Juan Pérez",
            "email": "juan.perez@example.com",
            "phone": "+56961234567",
            "location": "Santiago, Chile",
            "website": "juanperez.cl",
            "linkedin": "linkedin.com/in/juanperez",
            "github": "juanperez"
        },
        "summary": "Desarrollador con más de 5 años de experiencia en Python.",
        "experience": [
            {
                "id": "exp-1",
                "company": "Tech Corp",
                "position": "Senior Developer",
                "startDate": "2020-01",
                "current": True,
                "endDate": "",
                "location": "Santiago",
                "highlights": ["Lideré equipo de 5 personas."]
            }
        ],
        "education": [
            {
                "id": "edu-1",
                "institution": "Universidad de Chile",
                "degree": "Ingeniero Civil en Computación",
                "area": "Ciencias de la Computación",
                "startDate": "2015-03",
                "endDate": "2019-12",
                "gpa": "6.2"
            }
        ],
        "projects": [
            {
                "id": "proj-1",
                "name": "CV Builder",
                "url": "github.com/juanperez/cv",
                "date": "2023",
                "highlights": ["Código libre."]
            }
        ],
        "certifications": [
            {
                "id": "cert-1",
                "name": "AWS Certified Solutions Architect",
                "institution": "Amazon Web Services",
                "date": "2022",
                "url": "aws.amazon.com"
            }
        ],
        "volunteer": [
            {
                "id": "vol-1",
                "organization": "Cruz Roja",
                "position": "Voluntario",
                "startDate": "2018",
                "endDate": "2019",
                "current": False,
                "highlights": ["Primeros auxilios."]
            }
        ],
        "publications": [
            {
                "id": "pub-1",
                "title": "A secure web framework",
                "authors": "J. Pérez, A. Gómez",
                "date": "2021",
                "journal": "IEEE",
                "url": "ieee.org"
            }
        ],
        "skills": [
            {
                "label": "Lenguajes",
                "details": "Python, TypeScript, SQL"
            }
        ],
        "template": {
            "theme": "classic",
            "format": "pdf"
        }
    }


# UNIT TESTS (no subprocess, no network)

def test_recursive_sanitization(valid_payload):
    # Null bytes, control characters, RTL override, zero-width, emojis
    valid_payload["personal"]["name"] = "Juan\x00 \n\x1fPérez"
    valid_payload["personal"]["location"] = "Santiago\u200b, Chile\u202e"
    valid_payload["summary"] = "Resumen con emoji 🚀 y ñandúes."
    
    cv = CVRequest(**valid_payload)
    
    assert cv.personal.name == "Juan Pérez"  # Normalizado, control removed, stripped
    assert cv.personal.location == "Santiago\u200b, Chile\u202e"  # zero-width & RTL remain
    assert cv.summary == "Resumen con emoji 🚀 y ñandúes."


def test_fixed_output_paths_in_yaml(valid_payload):
    cv = CVRequest(**valid_payload)
    yaml_data = build_rendercv_yaml(cv)
    
    assert "settings" in yaml_data
    render_cmd = yaml_data["settings"]["render_command"]
    assert render_cmd["pdf_path"] == "OUTPUT_FOLDER/cv.pdf"
    assert render_cmd["typst_path"] == "OUTPUT_FOLDER/cv.typ"
    assert render_cmd["markdown_path"] == "OUTPUT_FOLDER/cv.md"
    assert render_cmd["html_path"] == "OUTPUT_FOLDER/cv.html"
    assert render_cmd["png_path"] == "OUTPUT_FOLDER/cv.png"


def test_phone_validation_without_country_code_fails(valid_payload):
    # Domestic Chilean format without '+' should fail validation
    valid_payload["personal"]["phone"] = "961234567"
    with pytest.raises(ValueError, match="Debe incluir el código de país"):
        CVRequest(**valid_payload)


def test_phone_validation_valid_formats(valid_payload):
    # Chile (+56) and US (+1)
    valid_payload["personal"]["phone"] = "+56 9 6123 4567"
    cv1 = CVRequest(**valid_payload)
    assert cv1.personal.phone == "+56 9 6123 4567"

    valid_payload["personal"]["phone"] = "+1 202-456-1111"
    cv2 = CVRequest(**valid_payload)
    assert cv2.personal.phone == "+1 202-456-1111"


def test_clean_name_escapes(valid_payload):
    valid_payload["personal"]["name"] = 'Juan \\"Pérez\\"'
    cv = CVRequest(**valid_payload)
    assert cv.personal.name == "Juan Pérez"


def test_rejection_matrix_missing_fields(valid_payload):
    # Missing required field name
    valid_payload["personal"]["name"] = "  "
    with pytest.raises(ValueError):
        CVRequest(**valid_payload)


def test_rejection_matrix_invalid_dates(valid_payload):
    # Date formats should be YYYY, YYYY-MM or YYYY-MM-DD
    valid_payload["experience"][0]["startDate"] = "01-02-2020"
    with pytest.raises(ValueError):
        CVRequest(**valid_payload)


def test_rejection_matrix_end_date_before_start_date(valid_payload):
    valid_payload["experience"][0]["startDate"] = "2022-01"
    valid_payload["experience"][0]["current"] = False
    valid_payload["experience"][0]["endDate"] = "2021-12"
    with pytest.raises(ValueError, match="no puede ser anterior a la fecha de inicio"):
        CVRequest(**valid_payload)


# ADVERSARIAL HTTP E2E TESTS (Ensure status code != 500)

def test_http_valid_request_200(valid_payload, can_render):
    if not can_render:
        pytest.skip("RenderCV rendering environment is not available in this test environment.")
    
    response = client.post("/generate-cv", json=valid_payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"


def test_http_missing_field_422(valid_payload):
    valid_payload["personal"]["name"] = ""
    response = client.post("/generate-cv", json=valid_payload)
    assert response.status_code == 422
    assert "name" in response.json()["detail"] or "obligatorio" in response.json()["detail"]


def test_http_summary_too_long_422(valid_payload):
    valid_payload["summary"] = "A" * 50000
    response = client.post("/generate-cv", json=valid_payload)
    assert response.status_code == 422
    assert "summary" in response.text


def test_http_adversarial_name_null_byte_success_or_422(valid_payload, can_render):
    # Null byte should be stripped by sanitization and generate 200 (if render works)
    valid_payload["personal"]["name"] = "Juan\x00Pérez"
    response = client.post("/generate-cv", json=valid_payload)
    if can_render:
        assert response.status_code == 200
    else:
        assert response.status_code in (200, 422)
    assert response.status_code != 500


def test_http_adversarial_name_slashes_quotes_success_or_422(valid_payload, can_render):
    # Slashes and quotes should not crash backend
    valid_payload["personal"]["name"] = 'Juan/ "Pérez"'
    response = client.post("/generate-cv", json=valid_payload)
    if can_render:
        assert response.status_code == 200
    else:
        assert response.status_code in (200, 422)
    assert response.status_code != 500


def test_http_special_chars_in_fields_success(valid_payload, can_render):
    # "Johnson & Johnson", "Crecí 50%", "C# / C++"
    valid_payload["experience"][0]["company"] = "Johnson & Johnson"
    valid_payload["experience"][0]["highlights"] = ["Crecí 50% en ventas", "Trabajé con C# / C++"]
    response = client.post("/generate-cv", json=valid_payload)
    if can_render:
        assert response.status_code == 200
    else:
        assert response.status_code in (200, 422)
    assert response.status_code != 500


def test_http_email_with_plus_and_subdomain(valid_payload, can_render):
    valid_payload["personal"]["email"] = "juan+test@sub.example.com"
    response = client.post("/generate-cv", json=valid_payload)
    if can_render:
        assert response.status_code == 200
    else:
        assert response.status_code in (200, 422)
    assert response.status_code != 500


def test_http_website_with_and_without_scheme(valid_payload, can_render):
    # website without scheme
    valid_payload["personal"]["website"] = "mywebsite.com"
    response1 = client.post("/generate-cv", json=valid_payload)
    
    # website with scheme
    valid_payload["personal"]["website"] = "https://mywebsite.com"
    response2 = client.post("/generate-cv", json=valid_payload)

    if can_render:
        assert response1.status_code == 200
        assert response2.status_code == 200
    else:
        assert response1.status_code in (200, 422)
        assert response2.status_code in (200, 422)
    assert response1.status_code != 500
    assert response2.status_code != 500


def test_http_socials_usernames_and_urls(valid_payload, can_render):
    # linkedin username and github URL %-encoded
    valid_payload["personal"]["linkedin"] = "linkedin.com/in/juan%20perez"
    valid_payload["personal"]["github"] = "https://github.com/juanperez"
    response = client.post("/generate-cv", json=valid_payload)
    if can_render:
        assert response.status_code == 200
    else:
        assert response.status_code in (200, 422)
    assert response.status_code != 500
