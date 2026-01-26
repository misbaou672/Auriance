"""Service pour la génération de rapports."""
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import json

logger = logging.getLogger(__name__)


class ReportGenerationService:
    """Génère des rapports structurés à partir du texte transcrit."""
    
    REPORT_TEMPLATES = {
        "medical": {
            "title": "Rapport Médical",
            "sections": [
                {"name": "Patient", "fields": ["name", "age", "email", "phone"]},
                {"name": "Consultation", "fields": ["date", "symptoms", "diagnosis"]},
                {"name": "Traitement", "fields": ["treatment", "notes"]}
            ]
        },
        "biodiversity": {
            "title": "Fiche d'Observation Naturaliste",
            "sections": [
                {"name": "Observation", "fields": ["species", "location", "date", "observer"]},
                {"name": "Description", "fields": ["physical_features", "behavior", "habitat"]},
                {"name": "Classification", "fields": ["classification", "rarity", "notes"]}
            ]
        },
        "administrative": {
            "title": "Rapport Administratif",
            "sections": [
                {"name": "Demandeur", "fields": ["name", "email", "phone", "address"]},
                {"name": "Demande", "fields": ["request_type", "description", "date"]},
                {"name": "Traitement", "fields": ["status", "notes", "conclusion"]}
            ]
        },
        "generic": {
            "title": "Rapport Générique",
            "sections": [
                {"name": "Informations", "fields": ["name", "email", "phone"]},
                {"name": "Contenu", "fields": ["content", "date", "summary"]}
            ]
        }
    }
    
    async def generate_report(
        self,
        text: str,
        extracted_fields: Dict[str, Any],
        report_type: Optional[str] = None,
        format: str = "json"
    ) -> Dict[str, Any]:
        """
        Génère un rapport structuré.
        
        Args:
            text: Texte transcrit
            extracted_fields: Champs extraits du texte
            report_type: Type de rapport (medical, biodiversity, administrative, generic)
            format: Format de sortie (json, pdf, markdown)
        
        Returns:
            Dict avec le rapport généré
        """
        try:
            logger.info(f"Génération rapport ({report_type or 'auto'})...")
            
            # Détecter le type si non spécifié
            if not report_type:
                report_type = self._detect_report_type(text)
            
            # Récupérer le template
            template = self.REPORT_TEMPLATES.get(report_type, self.REPORT_TEMPLATES["generic"])
            
            # Construire le rapport
            report = {
                "title": template["title"],
                "type": report_type,
                "generated_at": datetime.now().isoformat(),
                "sections": []
            }
            
            # Remplir les sections
            for section in template["sections"]:
                section_data = {
                    "name": section["name"],
                    "fields": {}
                }
                
                for field in section["fields"]:
                    section_data["fields"][field] = extracted_fields.get(field, "")
                
                report["sections"].append(section_data)
            
            # Ajouter le texte brut
            report["raw_text"] = text
            
            logger.info(f"✅ Rapport généré ({report_type})")
            
            # Formater selon le format demandé
            if format == "markdown":
                return {"markdown": self._format_as_markdown(report)}
            elif format == "pdf":
                return {"pdf_data": self._format_as_pdf(report)}
            else:
                return {"json": report}
        
        except Exception as e:
            logger.error(f"❌ Erreur génération rapport: {e}")
            return {"error": str(e)}
    
    async def generate_summary(
        self,
        text: str,
        max_length: int = 200
    ) -> Dict[str, Any]:
        """
        Génère un résumé du texte.
        
        Args:
            text: Texte à résumer
            max_length: Longueur maximale du résumé
        
        Returns:
            Dict avec le résumé
        """
        try:
            logger.info("Génération du résumé...")
            
            # Résumé simple (à améliorer avec un modèle NLP)
            sentences = text.split(".")
            summary_sentences = sentences[:min(2, len(sentences))]
            summary = ". ".join(summary_sentences) + "."
            
            if len(summary) > max_length:
                summary = summary[:max_length] + "..."
            
            logger.info(f"✅ Résumé généré: {summary[:100]}...")
            
            return {
                "summary": summary,
                "original_length": len(text),
                "summary_length": len(summary),
                "compression_ratio": len(summary) / len(text) if text else 0
            }
        
        except Exception as e:
            logger.error(f"❌ Erreur génération résumé: {e}")
            return {"error": str(e)}
    
    def _detect_report_type(self, text: str) -> str:
        """Détecte le type de rapport basé sur le contenu."""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ["symptôme", "douleur", "maladie", "patient", "diagnostic"]):
            return "medical"
        elif any(word in text_lower for word in ["espèce", "plante", "animal", "biodiversité", "habitat", "nature"]):
            return "biodiversity"
        elif any(word in text_lower for word in ["demande", "formulaire", "agence", "service", "administratif"]):
            return "administrative"
        
        return "generic"
    
    def _format_as_markdown(self, report: Dict[str, Any]) -> str:
        """Formate le rapport en Markdown."""
        md = f"# {report['title']}\n\n"
        md += f"**Généré le:** {report['generated_at']}\n\n"
        
        for section in report["sections"]:
            md += f"## {section['name']}\n\n"
            for field, value in section["fields"].items():
                md += f"- **{field}:** {value}\n"
            md += "\n"
        
        md += "## Texte brut\n\n"
        md += f"{report['raw_text']}\n"
        
        return md
    
    def _format_as_pdf(self, report: Dict[str, Any]) -> bytes:
        """Génère un PDF dynamique basé sur les champs fournis."""
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.pdfgen import canvas
            from io import BytesIO
            buffer = BytesIO()
            c = canvas.Canvas(buffer, pagesize=A4)
            
            # Titre
            c.setFont("Helvetica-Bold", 16)
            title = report.get("title", "Compte-rendu")
            c.drawString(50, 800, title)
            
            # Date/Docteur (si dispo)
            c.setFont("Helvetica", 10)
            c.setFillColorRGB(0.5, 0.5, 0.5)
            y_meta = 785
            if "date" in report:
                c.drawString(50, y_meta, f"Date: {report['date']}")
                y_meta -= 12
            if "doctor" in report:
                c.drawString(50, y_meta, f"Médecin: {report['doctor']}")
            
            c.setFillColorRGB(0, 0, 0)
            c.setFont("Helvetica", 12)
            y = 750
            
            # Contenu dynamique
            # On supporte soit un dict 'fields', soit une liste 'content' (format frontend récent)
            content = report.get("content") or report.get("fields") or report
            
            # Si c'est une liste de {label, value}
            if isinstance(content, list):
                for item in content:
                    label = item.get("label", "")
                    value = str(item.get("value", ""))
                    
                    # Gestion simplicime du saut de ligne
                    c.setFont("Helvetica-Bold", 12)
                    c.drawString(50, y, f"{label}:")
                    c.setFont("Helvetica", 12)
                    c.drawString(200, y, value) 
                    y -= 30
                    if y < 50:
                        c.showPage()
                        y = 800
            
            # Si c'est un dict simple {key: value}
            elif isinstance(content, dict):
                for k, v in content.items():
                    c.setFont("Helvetica-Bold", 12)
                    c.drawString(50, y, f"{k.capitalize()}:")
                    c.setFont("Helvetica", 12)
                    c.drawString(200, y, str(v))
                    y -= 30
                    if y < 50:
                        c.showPage()
                        y = 800

            c.showPage()
            c.save()
            pdf = buffer.getvalue()
            buffer.close()
            return pdf
        except Exception as e:
            # Fallback: PDF texte simple
            from io import BytesIO
            buffer = BytesIO()
            try:
                from fpdf import FPDF
                pdf = FPDF()
                pdf.add_page()
                pdf.set_font("Arial", size=12)
                pdf.cell(200, 10, txt="Formulaire Médical", ln=True)
                for k, v in report.get("fields", report).items():
                    pdf.cell(200, 10, txt=f"{k}: {v}", ln=True)
                pdf.output(buffer)
                return buffer.getvalue()
            except Exception:
                # Dernier fallback: bytes du JSON
                return json.dumps(report, ensure_ascii=False, indent=2).encode("utf-8")
    
    async def batch_generate_reports(
        self,
        texts: list,
        extracted_fields_list: list,
        report_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Génère plusieurs rapports en batch.
        
        Args:
            texts: Liste de textes
            extracted_fields_list: Liste des champs extraits
            report_type: Type de rapport (optionnel)
        
        Returns:
            Dict avec liste des rapports générés
        """
        try:
            reports = []
            for text, fields in zip(texts, extracted_fields_list):
                report = await self.generate_report(text, fields, report_type)
                reports.append(report)
            
            logger.info(f"✅ {len(reports)} rapports générés")
            
            return {
                "total": len(reports),
                "reports": reports
            }
        
        except Exception as e:
            logger.error(f"❌ Erreur génération batch: {e}")
            return {"error": str(e)}
