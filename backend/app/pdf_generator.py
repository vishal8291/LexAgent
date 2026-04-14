from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
from .models import LegalReport
from datetime import datetime

# Colors
PURPLE     = HexColor('#7c6af7')
DARK_BG    = HexColor('#1a1a2e')
DANGER     = HexColor('#f87171')
CAUTION    = HexColor('#fbbf24')
SAFE       = HexColor('#4ade80')
DARK_TEXT  = HexColor('#1f1f1f')
LIGHT_TEXT = HexColor('#555555')
WHITE      = HexColor('#ffffff')
LIGHT_BG   = HexColor('#f8f7ff')

def generate_pdf_report(report: LegalReport) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    story = []

    # Title style
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Normal'],
        fontSize=28,
        fontName='Helvetica-Bold',
        textColor=PURPLE,
        spaceAfter=4,
        alignment=TA_CENTER
    )

    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=11,
        fontName='Helvetica',
        textColor=LIGHT_TEXT,
        spaceAfter=2,
        alignment=TA_CENTER
    )

    heading_style = ParagraphStyle(
        'Heading',
        parent=styles['Normal'],
        fontSize=13,
        fontName='Helvetica-Bold',
        textColor=PURPLE,
        spaceBefore=16,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontSize=10,
        fontName='Helvetica',
        textColor=DARK_TEXT,
        spaceAfter=6,
        leading=16
    )

    hindi_style = ParagraphStyle(
        'Hindi',
        parent=styles['Normal'],
        fontSize=10,
        fontName='Helvetica',
        textColor=DARK_TEXT,
        spaceAfter=6,
        leading=16
    )

    small_style = ParagraphStyle(
        'Small',
        parent=styles['Normal'],
        fontSize=9,
        fontName='Helvetica',
        textColor=LIGHT_TEXT,
        spaceAfter=4
    )

    # Header
    story.append(Paragraph("LexAgent", title_style))
    story.append(Paragraph("AI Legal Auditor for Indian SMEs", subtitle_style))
    story.append(Paragraph(
        f"Report generated: {datetime.now().strftime('%d %B %Y, %I:%M %p')}",
        subtitle_style
    ))
    story.append(Spacer(1, 12))
    story.append(HRFlowable(width="100%", thickness=1, color=PURPLE))
    story.append(Spacer(1, 16))

    # Document name
    story.append(Paragraph(f"Document: {report.document_name}", heading_style))

    # Verdict box
    verdict_color = SAFE if report.overall_verdict == "Safe" else \
                    CAUTION if report.overall_verdict == "Caution" else DANGER

    verdict_emoji = "✓ SAFE" if report.overall_verdict == "Safe" else \
                    "⚠ CAUTION" if report.overall_verdict == "Caution" else "✗ DANGER"

    verdict_table = Table(
        [[
            Paragraph(f"<b>{verdict_emoji}</b>", ParagraphStyle(
                'VerdictText',
                parent=styles['Normal'],
                fontSize=18,
                fontName='Helvetica-Bold',
                textColor=WHITE,
                alignment=TA_CENTER
            )),
            Paragraph(f"<b>Risk Score: {report.risk_score}/100</b>", ParagraphStyle(
                'ScoreText',
                parent=styles['Normal'],
                fontSize=14,
                fontName='Helvetica-Bold',
                textColor=WHITE,
                alignment=TA_CENTER
            ))
        ]],
        colWidths=[250, 250]
    )
    verdict_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), verdict_color),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [verdict_color]),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROUNDEDCORNERS', [8, 8, 8, 8]),
        ('TOPPADDING', (0, 0), (-1, -1), 16),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 16),
    ]))
    story.append(verdict_table)
    story.append(Spacer(1, 16))

    # Summary
    story.append(Paragraph("Document Summary", heading_style))
    story.append(Paragraph(report.summary, body_style))
    story.append(Spacer(1, 8))

    # Summary in English and Hindi
    summary_table = Table(
        [[
            Paragraph(f"<b>English</b><br/>{report.plain_english_summary}", body_style),
            Paragraph(f"<b>Hindi</b><br/>{report.plain_hindi_summary}", hindi_style)
        ]],
        colWidths=[245, 245]
    )
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 0.5, HexColor('#e0e0e0')),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 8))

    # Risky Clauses
    if report.risky_clauses:
        story.append(Paragraph(
            f"Risky Clauses Found ({len(report.risky_clauses)})",
            heading_style
        ))

        for i, clause in enumerate(report.risky_clauses):
            risk_color = DANGER if clause.risk_level == "High" else \
                         CAUTION if clause.risk_level == "Medium" else SAFE

            # Clause header
            clause_header = Table(
                [[
                    Paragraph(f"<b>{i+1}. {clause.clause_title}</b>", ParagraphStyle(
                        'ClauseTitle',
                        parent=styles['Normal'],
                        fontSize=11,
                        fontName='Helvetica-Bold',
                        textColor=WHITE
                    )),
                    Paragraph(f"<b>{clause.risk_level} Risk</b>", ParagraphStyle(
                        'RiskBadge',
                        parent=styles['Normal'],
                        fontSize=10,
                        fontName='Helvetica-Bold',
                        textColor=WHITE,
                        alignment=TA_CENTER
                    ))
                ]],
                colWidths=[380, 110]
            )
            clause_header.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), risk_color),
                ('ALIGN', (1, 0), (1, 0), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('LEFTPADDING', (0, 0), (0, 0), 12),
            ]))
            story.append(clause_header)

            # Clause body
            clause_body = Table(
                [[
                    Paragraph(
                        f"<i>\"{clause.original_text}\"</i>",
                        small_style
                    )
                ],
                [
                    Table(
                        [[
                            Paragraph(
                                f"<b>English:</b> {clause.explanation_english}",
                                body_style
                            ),
                            Paragraph(
                                f"<b>Hindi:</b> {clause.explanation_hindi}",
                                hindi_style
                            )
                        ]],
                        colWidths=[235, 235]
                    )
                ],
                [
                    Paragraph(
                        f"<b>What to do:</b> {clause.recommendation}",
                        ParagraphStyle(
                            'Recommendation',
                            parent=styles['Normal'],
                            fontSize=10,
                            fontName='Helvetica',
                            textColor=HexColor('#3d2e9c'),
                            spaceAfter=4,
                            leading=14
                        )
                    )
                ]],
                colWidths=[490]
            )
            clause_body.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG),
                ('TOPPADDING', (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
                ('LEFTPADDING', (0, 0), (-1, -1), 12),
                ('RIGHTPADDING', (0, 0), (-1, -1), 12),
                ('LINEBELOW', (0, 0), (-1, -2), 0.5, HexColor('#e0e0e0')),
            ]))
            story.append(clause_body)
            story.append(Spacer(1, 10))

    # What to negotiate
    if report.what_to_negotiate:
        story.append(Paragraph("What To Negotiate", heading_style))
        for item in report.what_to_negotiate:
            story.append(Paragraph(f"• {item}", body_style))
        story.append(Spacer(1, 8))

    # GST issues
    if report.gst_compliance_issues:
        story.append(Paragraph("GST Compliance Issues", heading_style))
        for item in report.gst_compliance_issues:
            story.append(Paragraph(f"• {item}", body_style))
        story.append(Spacer(1, 8))

    # Footer
    story.append(Spacer(1, 16))
    story.append(HRFlowable(width="100%", thickness=0.5, color=LIGHT_TEXT))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "Generated by LexAgent — AI Legal Auditor for Indian SMEs | lexagent.in",
        ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=LIGHT_TEXT,
            alignment=TA_CENTER
        )
    ))

    doc.build(story)
    return buffer.getvalue()