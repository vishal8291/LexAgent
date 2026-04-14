import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from .models import LegalReport, RiskyClause

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def analyze_legal_document(document_text: str, filename: str, language: str = "hindi") -> LegalReport:

    lang_config = {
        "hindi":    { "name": "Hindi",    "native": "हिंदी",    "instruction": "Write in simple Hindi (हिंदी). Use Hinglish if needed." },
        "english":  { "name": "English",  "native": "English",  "instruction": "Write in simple English only." },
        "tamil":    { "name": "Tamil",    "native": "தமிழ்",    "instruction": "Write in simple Tamil (தமிழ்). Use Tamil-English mix if needed." },
        "marathi":  { "name": "Marathi",  "native": "मराठी",    "instruction": "Write in simple Marathi (मराठी). Use Marathi-English mix if needed." },
        "bengali":  { "name": "Bengali",  "native": "বাংলা",    "instruction": "Write in simple Bengali (বাংলা). Use Bengali-English mix if needed." },
        "gujarati": { "name": "Gujarati", "native": "ગુજરાતી", "instruction": "Write in simple Gujarati (ગુજરાતી). Use Gujarati-English mix if needed." },
        "telugu":   { "name": "Telugu",   "native": "తెలుగు",   "instruction": "Write in simple Telugu (తెలుగు). Use Telugu-English mix if needed." },
        "kannada":  { "name": "Kannada",  "native": "ಕನ್ನಡ",   "instruction": "Write in simple Kannada (ಕನ್ನಡ). Use Kannada-English mix if needed." },
    }

    cfg = lang_config.get(language.lower(), lang_config["hindi"])
    lang_name     = cfg["name"]
    lang_native   = cfg["native"]
    lang_full     = f"{lang_name} ({lang_native})"
    lang_instr    = cfg["instruction"]

    prompt = f"""
You are LexAgent — an expert AI legal advisor specializing in
Indian business law, contracts, and GST compliance.
You help small Indian business owners (SMEs) understand legal documents.

SELECTED LANGUAGE: {lang_full}
RULE: Every field named "local_explanation" and "local_summary" in your JSON
      MUST be written ONLY in {lang_full}.
      Do NOT write Hindi in these fields unless the selected language is Hindi.
      Do NOT write English in these fields unless the selected language is English.
      You MUST write in {lang_full} script. This is mandatory.

Analyze the document below and return ONLY a JSON object.
No markdown. No code blocks. No explanation. Just raw JSON.

DOCUMENT NAME: {filename}

DOCUMENT CONTENT:
{document_text}

Return ONLY this exact JSON structure:

{{
    "document_name": "{filename}",
    "overall_verdict": "Safe OR Caution OR Danger",
    "risk_score": a number from 0 to 100,
    "summary": "2-3 sentence summary in English",
    "risky_clauses": [
        {{
            "clause_title": "Name of clause in English",
            "original_text": "Exact problematic text from document (max 100 words)",
            "risk_level": "Low OR Medium OR High",
            "explanation_english": "Simple explanation in English",
            "local_explanation": "{lang_instr} — explain this clause in {lang_full} only",
            "recommendation": "What the SME should do — in English"
        }}
    ],
    "gst_compliance_issues": [
        "GST issue in English"
    ],
    "what_to_negotiate": [
        "Negotiation point in English"
    ],
    "plain_english_summary": "3-4 sentences in simple English",
    "local_summary": "{lang_instr} — write 3-4 sentence summary in {lang_full} only"
}}

Focus on:
- Unfair payment terms
- Auto-renewal clauses
- Penalty and liability clauses
- Intellectual property ownership
- Termination conditions
- Non-compete clauses
- GST compliance issues
- Any clause that disadvantages the SME

REMINDER: "local_explanation" and "local_summary" fields MUST be in {lang_full}.
NOT Hindi. NOT English (unless selected). In {lang_full} ONLY.

Return ONLY the JSON. Nothing else.
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    f"You are a legal document analyzer. "
                    f"You always respond with pure JSON only — no markdown, no code blocks, no extra text. "
                    f"The user has selected {lang_full} as their language. "
                    f"You MUST write the 'local_explanation' and 'local_summary' fields in {lang_full} script. "
                    f"Writing Hindi in these fields when the user selected {lang_name} is a critical error. "
                    f"If the language is Bengali, write Bengali (বাংলা). "
                    f"If Tamil, write Tamil (தமிழ்). "
                    f"If Gujarati, write Gujarati (ગુજરાતી). "
                    f"If Telugu, write Telugu (తెలుగు). "
                    f"If Kannada, write Kannada (ಕನ್ನಡ). "
                    f"If Marathi, write Marathi (मराठी). "
                    f"Always use the correct script."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
        max_tokens=3000
    )

    raw = response.choices[0].message.content.strip()

    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()

    data = json.loads(raw)

    risky_clauses = []
    for clause in data.get("risky_clauses", []):
        risky_clauses.append(RiskyClause(
            clause_title=clause["clause_title"],
            original_text=clause["original_text"],
            risk_level=clause["risk_level"],
            explanation_hindi=clause.get("local_explanation", ""),
            explanation_english=clause.get("explanation_english", ""),
            recommendation=clause.get("recommendation", "")
        ))

    return LegalReport(
        document_name=data["document_name"],
        overall_verdict=data["overall_verdict"],
        risk_score=data["risk_score"],
        summary=data["summary"],
        risky_clauses=risky_clauses,
        gst_compliance_issues=data.get("gst_compliance_issues", []),
        what_to_negotiate=data.get("what_to_negotiate", []),
        plain_english_summary=data["plain_english_summary"],
        plain_hindi_summary=data.get("local_summary", "")
    )
