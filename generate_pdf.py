import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        # Draw background color for every page
        self.setFillColor(colors.HexColor('#f5f2eb'))
        self.rect(0, 0, self._pagesize[0], self._pagesize[1], fill=1, stroke=0)
        
        # Skip header/footer on cover page
        if self._pageNumber == 1:
            self.restoreState()
            return
            
        # Draw header
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor('#0d0d0c'))
        self.drawString(54, self._pagesize[1] - 40, "ALTRIX AGENCY")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor('#5c5549'))
        self.drawRightString(self._pagesize[0] - 54, self._pagesize[1] - 40, "Brand & Web Design Studio")
        
        # Header divider
        self.setStrokeColor(colors.HexColor('#edeae3'))
        self.setLineWidth(1)
        self.line(54, self._pagesize[1] - 45, self._pagesize[0] - 54, self._pagesize[1] - 45)
        
        # Footer
        self.line(54, 55, self._pagesize[0] - 54, 55)
        self.drawString(54, 42, "team@altrixagency.in  |  +91 8248858180")
        self.drawRightString(self._pagesize[0] - 54, 42, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def build_pdf(filename="altrix_agency_brochure.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=60,
        bottomMargin=70
    )
    
    styles = getSampleStyleSheet()
    c_primary = colors.HexColor('#0d0d0c')
    c_secondary = colors.HexColor('#5c5549')
    
    style_cover_title = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=32,
        leading=38,
        textColor=c_primary,
        spaceAfter=10
    )
    
    style_cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=c_secondary,
        spaceAfter=30
    )
    
    style_h1 = ParagraphStyle(
        'H1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=c_primary,
        spaceBefore=15,
        spaceAfter=15,
        keepWithNext=True
    )
    
    style_h2 = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=8,
        keepWithNext=True
    )
    
    style_body = ParagraphStyle(
        'Body',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14.5,
        textColor=c_secondary,
        spaceAfter=12
    )

    style_body_bold = ParagraphStyle(
        'BodyBold',
        parent=style_body,
        fontName='Helvetica-Bold',
        textColor=c_primary
    )
    
    style_quote = ParagraphStyle(
        'Quote',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=10,
        leading=15,
        textColor=c_secondary,
        backColor=colors.HexColor('#fcfbfa'),
        borderColor=colors.HexColor('#edeae3'),
        borderWidth=1,
        borderPadding=12,
        spaceBefore=12,
        spaceAfter=12
    )
    
    story = []
    
    # ── COVER PAGE ──
    story.append(Spacer(1, 100))
    if os.path.exists("logo.jpg"):
        story.append(Image("logo.jpg", width=80, height=80))
        story.append(Spacer(1, 20))
        
    story.append(Paragraph("ALTRIX AGENCY", style_cover_title))
    story.append(Paragraph("BRAND & WEB DESIGN STUDIO", style_cover_subtitle))
    
    story.append(Spacer(1, 120))
    
    meta_data = [
        [Paragraph("<b>OFFICIAL PORTFOLIO & BROCHURE</b>", style_body_bold)],
        [Paragraph("Custom websites, dashboards, and storefronts for growth-minded brands.", style_body)],
        [Paragraph("✉️ &nbsp; team@altrixagency.in &nbsp; &nbsp; 📞 &nbsp; +91 8248858180 &nbsp; &nbsp; 🌐 &nbsp; www.altrixagency.in", style_body)]
    ]
    meta_table = Table(meta_data, colWidths=[500])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fcfbfa')),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor('#edeae3')),
        ('PADDING', (0,0), (-1,-1), 16),
        ('BOTTOMPADDING', (0,-1), (-1,-1), 16),
    ]))
    story.append(meta_table)
    story.append(PageBreak())
    
    # ── ABOUT & FOUNDERS ──
    story.append(Paragraph("Who We Are", style_h1))
    story.append(Paragraph(
        "A great website is not just a digital placeholder—it is your brand's most powerful asset. "
        "At Altrix, we close the gap between brand ambition and engineering execution. We design modern visual identities, "
        "build lightning-fast web systems, and deploy clean code that operates flawlessly across platforms.",
        style_body
    ))
    
    story.append(Paragraph("Meet the Leadership", style_h2))
    
    founders_data = [
        [
            Paragraph("<b>Thanseer</b><br/><font color='#5c5549'>Chief Operating Officer</font>", style_body_bold),
            Paragraph("Directs our operational execution, creative visual quality assurance, and design layout compliance, ensuring every pixel matches the high-end vision.", style_body)
        ],
        [
            Paragraph("<b>Owais</b><br/><font color='#5c5549'>Chief Technology Officer</font>", style_body_bold),
            Paragraph("Leads all technical engineering, speed optimizations, animation physics, and Next.js backend systems to deliver lightweight, clean code bases.", style_body)
        ],
        [
            Paragraph("<b>Harshad</b><br/><font color='#5c5549'>Chief Relationship Officer</font>", style_body_bold),
            Paragraph("Coordinates client onboarding, communication channels, relationship success, and manages ongoing partnerships with our business sectors.", style_body)
        ]
    ]
    
    founders_table = Table(founders_data, colWidths=[150, 350])
    founders_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-2), 0.5, colors.HexColor('#edeae3')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(founders_table)
    story.append(PageBreak())
    
    # ── SERVICES & PORTFOLIO ──
    story.append(Paragraph("Core Offerings", style_h1))
    
    services_data = [
        [
            Paragraph("<b>UI/UX Brand Design</b>", style_body_bold),
            Paragraph("Premium, customized user interface designs built from scratch. We focus on modern typography, minimalist aesthetics, and custom graphics tailored to premium audiences.", style_body)
        ],
        [
            Paragraph("<b>High-Fidelity Engineering</b>", style_body_bold),
            Paragraph("We engineer responsive, lightweight frontends using Next.js, Webflow, or pure HTML5/CSS3. All sites are optimized for 100/100 Google PageSpeed scores, clean SEO crawling, and 120Hz micro-interactions.", style_body)
        ],
        [
            Paragraph("<b>Shopify E-Commerce</b>", style_body_bold),
            Paragraph("Custom Shopify storefront architectures engineered to reduce friction, elevate brand trust, and maximize average checkout values.", style_body)
        ]
    ]
    
    services_table = Table(services_data, colWidths=[150, 350])
    services_table.setStyle(TableStyle([
        ('LINEBELOW', (0,0), (-1,-2), 0.5, colors.HexColor('#edeae3')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(services_table)
    
    story.append(Spacer(1, 15))
    story.append(Paragraph("Featured Work", style_h1))
    story.append(Paragraph("<b>HPT Group UAE (hptgroupuae.com)</b>", style_body_bold))
    story.append(Paragraph(
        "A premium corporate web platform designed and built to present HPT Group's diverse business divisions in the United Arab Emirates. "
        "Features include clean grids, modern typography scales, high performance speeds, and full mobile optimization.",
        style_body
    ))
    story.append(PageBreak())
    
    # ── PRICING & INQUIRY ──
    story.append(Paragraph("Transparent Pricing Tiers (INR)", style_h1))
    story.append(Paragraph("All projects are scoped transparently with zero hidden fees. Maintenance and launch setup are included in all packages.", style_body))
    
    pricing_headers = [
        Paragraph("<b>Package Tier</b>", style_body_bold),
        Paragraph("<b>Budget Range</b>", style_body_bold),
        Paragraph("<b>Deliverables</b>", style_body_bold)
    ]
    
    pricing_rows = [
        pricing_headers,
        [
            Paragraph("<b>Growth</b>", style_body_bold),
            Paragraph("₹2,000 – ₹5,000", style_body),
            Paragraph("Single-page design, responsive layout, custom animations, basic SEO, contact form integration.", style_body)
        ],
        [
            Paragraph("<b>Pro</b>", style_body_bold),
            Paragraph("₹5,000 – ₹10,000", style_body),
            Paragraph("Multi-page website (up to 5 pages), structured JSON-LD schemas, Google Search Console index submission, interactive elements, custom brand iconography.", style_body)
        ],
        [
            Paragraph("<b>Enterprise</b>", style_body_bold),
            Paragraph("₹20,000+", style_body),
            Paragraph("Custom web systems, database API integration, advanced admin panel storefronts, automated email pipelines, full premium animations library, unlimited scaling support.", style_body)
        ]
    ]
    
    pricing_table = Table(pricing_rows, colWidths=[100, 110, 290])
    pricing_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#edeae3')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#edeae3')),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#fcfbfa')),
    ]))
    story.append(pricing_table)
    
    story.append(Spacer(1, 30))
    story.append(Paragraph("Start Your Project", style_h1))
    
    cta_text = (
        "Ready to elevate your digital presence? Reach out to our founders directly. "
        "We typically reply within 2 hours to schedule a 10-minute discovery call.<br/><br/>"
        "<b>📞 Call/WhatsApp:</b> +91 8248858180<br/>"
        "<b>✉️ Business Email:</b> team@altrixagency.in<br/>"
        "<b>🌐 Agency Website:</b> www.altrixagency.in"
    )
    story.append(Paragraph(cta_text, style_quote))
    
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {filename}")

if __name__ == "__main__":
    build_pdf()
