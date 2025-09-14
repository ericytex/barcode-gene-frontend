#!/usr/bin/env python3
"""
Barcode Generator Script
Generates barcode labels with IMEI, model info, and QR codes based on input data
"""

import pandas as pd
from PIL import Image, ImageDraw, ImageFont
import qrcode
from barcode import Code128
from barcode.writer import ImageWriter
import io
import os
from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.utils import ImageReader
import glob

class BarcodeGenerator:
    def __init__(self, output_dir="generated_barcodes"):
        self.output_dir = output_dir
        self.create_output_directory()
        
    def extract_color_from_product(self, product_string):
        """Extract color from product string like 'SMART 8 64+3 SHINY GOLD'"""
        if not product_string or product_string == 'nan':
            return 'Unknown Color'
        
        # Split the product string into parts
        parts = str(product_string).strip().split()
        
        if len(parts) < 2:
            return 'Unknown Color'
        
        # Look for the last part that contains a '+' (storage spec like +3, +8, +256)
        # The color should be everything after the storage specification
        color_start_index = 0
        
        for i, part in enumerate(parts):
            if '+' in part and any(char.isdigit() for char in part):
                # Found storage spec, color starts after this
                color_start_index = i + 1
                break
        
        # If we found a storage spec, extract everything after it as color
        if color_start_index > 0 and color_start_index < len(parts):
            color_parts = parts[color_start_index:]
            color = ' '.join(color_parts)
            return color.upper() if color else 'Unknown Color'
        
        # Fallback: if no storage spec found, assume last 1-2 words are color
        if len(parts) >= 2:
            # Try last 2 words first (for colors like "SLEEK BLACK")
            color = ' '.join(parts[-2:])
            return color.upper()
        else:
            return 'Unknown Color'
        
    def create_output_directory(self):
        """Create output directory if it doesn't exist"""
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
    
    def generate_qr_code(self, data, size=(100, 100)):
        """Generate QR code for given data"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=3,
            border=1,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        qr_img = qr.make_image(fill_color="black", back_color="white")
        qr_img = qr_img.resize(size, Image.Resampling.LANCZOS)
        return qr_img
    
    def generate_code128_barcode(self, data, width=200, height=50):
        """Generate Code128 barcode for IMEI without text"""
        # Create barcode with writer options to exclude text
        code128 = Code128(data, writer=ImageWriter())
        
        # Generate barcode image in memory with options to remove text and make less bold
        buffer = io.BytesIO()
        options = {
            'write_text': False,  # Don't write text under barcode
            'quiet_zone': 0,      # No quiet zone
            'module_width': 0.2,  # Make bars thinner (less bold)
            'module_height': 15,  # Adjust height for thinner bars
        }
        code128.write(buffer, options=options)
        buffer.seek(0)
        
        # Open and resize the image
        barcode_img = Image.open(buffer)
        barcode_img = barcode_img.resize((width, height), Image.Resampling.LANCZOS)
        
        return barcode_img
    
    def create_barcode_label(self, imei, model, color, dn, box_id=None, brand="Infinix"):
        """--- FINAL VERSION --- Creates a clean, perfectly aligned barcode label matching the reference image."""
        
        # Dimensions to match the reference image layout
        label_width = 650
        label_height = 300 
        
        label = Image.new('RGB', (label_width, label_height), 'white')
        draw = ImageDraw.Draw(label)
        
        # Font loading with proper fallbacks
        try:
            # Try to load Arial Bold for main text
            font_large = ImageFont.truetype("ARIALBD.TTF", 35)
            font_medium = ImageFont.truetype("ARIALBD.TTF", 20)
            font_circle = ImageFont.truetype("ARIALBD.TTF", 28)
        except:
            try:
                # Try system Arial Bold
                font_large = ImageFont.truetype("/System/Library/Fonts/Arial Bold.ttf", 40)
                font_medium = ImageFont.truetype("/System/Library/Fonts/Arial Bold.ttf", 20)
                font_circle = ImageFont.truetype("/System/Library/Fonts/Arial Bold.ttf", 28)
            except:
                # Fallback to default
                font_large = ImageFont.load_default()
                font_medium = ImageFont.load_default()
                font_circle = ImageFont.load_default()
        
        try:
            # Try to load regular Arial for numbers
            font_regular = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 18)
        except:
            try:
                font_regular = ImageFont.truetype("arial.ttf", 18)
            except:
                font_regular = ImageFont.load_default()

        # --- Top Text (Model and Color) - Match reference layout ---
        x_start = 30
        y_top = 20  # Slightly higher positioning
        
        # Draw model (left side)
        draw.text((x_start, y_top), model, fill='black', font=font_large)
        
        # Draw color (right side, aligned with model)
        color_text = color.upper()
        color_bbox = draw.textbbox((0, 0), color_text, font=font_large)
        color_width = color_bbox[2] - color_bbox[0]
        x_pos_color = label_width - color_width - 60  # Right-aligned
        draw.text((x_pos_color, y_top), color_text, fill='black', font=font_large)

        # --- Barcodes and Text - Match reference positioning exactly ---
        barcode_width = 460
        barcode_height = 60
        
        # 1. First Barcode (IMEI)
        y_pos = 70  # Start position for first barcode
        imei_barcode_img = self.generate_code128_barcode(imei, width=barcode_width, height=barcode_height)
        label.paste(imei_barcode_img, (x_start, y_pos))
        
        # IMEI label directly under barcode - scale to fit barcode width
        y_pos += barcode_height + 8  # Move y_pos below the barcode
        
        # Split text: "IMEI" (bold) and the number (regular)
        imei_label = "IMEI"
        imei_number = imei
        
        # Calculate font size to fit barcode width
        test_font = font_medium
        full_text = f"{imei_label} {imei_number}"
        text_bbox = draw.textbbox((0, 0), full_text, font=test_font)
        text_width = text_bbox[2] - text_bbox[0]
        
        # Scale font size to fit barcode width
        if text_width < barcode_width:
            scale_factor = barcode_width / text_width
            new_font_size = int(16 * scale_factor)
            try:
                # Bold font for "IMEI"
                bold_font = ImageFont.truetype("ARIALBD.TTF", new_font_size)
                # Regular font for the number
                regular_font = ImageFont.truetype("arial.ttf", new_font_size)
            except:
                try:
                    bold_font = ImageFont.truetype("/System/Library/Fonts/Arial Bold.ttf", new_font_size)
                    regular_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", new_font_size)
                except:
                    bold_font = font_medium
                    regular_font = font_regular
        else:
            bold_font = font_medium
            regular_font = font_regular
        
        # Draw "IMEI" in bold
        draw.text((x_start, y_pos), imei_label, fill='black', font=bold_font)
        
        # Calculate position for the number (after "IMEI")
        imei_bbox = draw.textbbox((0, 0), imei_label, font=bold_font)
        imei_width = imei_bbox[2] - imei_bbox[0]
        number_x = x_start + imei_width + 5  # Small space between "IMEI" and number
        
        # Calculate available space for the number (to end of barcode)
        available_width = barcode_width - (number_x - x_start)
        
        # Scale the number font to fit the available space
        number_bbox = draw.textbbox((0, 0), imei_number, font=regular_font)
        number_width = number_bbox[2] - number_bbox[0]
        
        if number_width < available_width:
            number_scale_factor = available_width / number_width
            number_font_size = int(25 * number_scale_factor)
            try:
                stretched_number_font = ImageFont.truetype("arial.ttf", number_font_size)
            except:
                try:
                    stretched_number_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", number_font_size)
                except:
                    stretched_number_font = regular_font
        else:
            stretched_number_font = regular_font
        
        # Draw the number in stretched font to fill the barcode width
        draw.text((number_x, y_pos), imei_number, fill='black', font=stretched_number_font)
        
        # 2. Second Barcode (Box ID)
        if box_id:
            y_pos += 35  # Add vertical space for the next barcode
            box_barcode_img = self.generate_code128_barcode(box_id, width=barcode_width, height=barcode_height)
            label.paste(box_barcode_img, (x_start, y_pos))
            
            # Box ID label directly under barcode - scale to fit barcode width
            y_pos += barcode_height + 0  # Move y_pos below the barcode
            
            # Split text: "Box ID" (bold) and the number (Arial Bold)
            box_label = "Box ID"
            box_number = box_id
            
            # Calculate font size to fit barcode width
            test_font = font_medium
            full_text = f"{box_label} {box_number}"
            text_bbox = draw.textbbox((0, 0), full_text, font=test_font)
            text_width = text_bbox[2] - text_bbox[0]
            
            # Scale font size to fit barcode width
            if text_width < barcode_width:
                scale_factor = barcode_width / text_width
                new_font_size = int(16 * scale_factor)
                try:
                    # Bold font for "Box ID"
                    bold_font = ImageFont.truetype("ARIALBD.TTF", new_font_size)
                    # Regular Arial for the number
                    number_font = ImageFont.truetype("arial.ttf", new_font_size)
                except:
                    try:
                        bold_font = ImageFont.truetype("/System/Library/Fonts/Arial Bold.ttf", new_font_size)
                        number_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", new_font_size)
                    except:
                        bold_font = font_medium
                        number_font = font_regular
            else:
                bold_font = font_medium
                number_font = font_medium
            
            # Draw "Box ID" in bold
            draw.text((x_start, y_pos), box_label, fill='black', font=bold_font)
            
            # Calculate position for the number (after "Box ID")
            box_bbox = draw.textbbox((0, 0), box_label, font=bold_font)
            box_width = box_bbox[2] - box_bbox[0]
            number_x = x_start + box_width + 5  # Small space between "Box ID" and number
            
            # Calculate available space for the number (to end of barcode)
            available_width = barcode_width - (number_x - x_start)
            
            # Scale the number font to fit the available space
            number_bbox = draw.textbbox((0, 0), box_number, font=number_font)
            number_width = number_bbox[2] - number_bbox[0]
            
            if number_width < available_width:
                number_scale_factor = available_width / number_width
                number_font_size = int(25 * number_scale_factor)  # Same scale as IMEI number
                try:
                    stretched_number_font = ImageFont.truetype("arial.ttf", number_font_size)
                except:
                    try:
                        stretched_number_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", number_font_size)
                    except:
                        stretched_number_font = number_font
            else:
                stretched_number_font = number_font
            
            # Draw the number in stretched regular Arial font to fill the barcode width
            draw.text((number_x, y_pos), box_number, fill='black', font=stretched_number_font)

            # D/N Text - positioned directly below Box ID
            y_pos += 35  # Add space below Box ID label

            # Font size control for D/N text
            dn_font_size = 30  # You can adjust this value as needed
            try:
                dn_font = ImageFont.truetype("arial.ttf", dn_font_size)
            except:
                try:
                    dn_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", dn_font_size)
                except:
                    dn_font = font_large  # fallback

            draw.text((x_start, y_pos), f"D/N: {dn}", fill='black', font=dn_font)

        # --- QR Code and Circled 'A' - Match reference positioning exactly ---
        qr_size = 150
        qr_data = imei  # Only IMEI data in QR code
        qr_code_img = self.generate_qr_code(qr_data, size=(qr_size, qr_size))
        
        # Position QR code on the right side, aligned with first barcode
        qr_x_pos = label_width - qr_size - 0
        qr_y_pos = 65  # Align with first barcode
        label.paste(qr_code_img, (qr_x_pos, qr_y_pos))

        # Circled 'A' - positioned below QR code, aligned with bottom barcode
        circle_diameter = 40
        circle_x_center = qr_x_pos + (qr_size / 2) + 15 # Perfectly centered under QR code
        circle_y_center = 270  # Positioned to align with bottom elements
        
        # Draw circle outline with precise positioning
        circle_left = circle_x_center - circle_diameter / 2
        circle_top = circle_y_center - circle_diameter / 2
        circle_right = circle_x_center + circle_diameter / 2
        circle_bottom = circle_y_center + circle_diameter / 2
        
        circle_bbox_coords = [circle_left, circle_top, circle_right, circle_bottom]
        draw.ellipse(circle_bbox_coords, outline='black', width=2)
        
        # Center the 'A' perfectly in the circle using textanchor
        a_bbox = draw.textbbox((0, 0), "A", font=font_circle)
        a_width = a_bbox[2] - a_bbox[0]
        a_height = a_bbox[3] - a_bbox[1]
        
        # Calculate exact center position for the 'A' within the circle
        # Account for PIL's text positioning quirks
        a_x = circle_x_center - a_width / 2
        a_y = circle_y_center - a_height / 2 - 3  # Increased adjustment for better centering
        
        # Draw the 'A' at the calculated center position
        draw.text((a_x, a_y), "A", fill='black', font=font_circle)
        
        return label
    
    def create_pdf_from_barcodes(self, pdf_filename=None, grid_cols=5, grid_rows=12):
        """Create a PDF with all generated barcode images arranged in a grid"""
        
        # Create PDF output directory
        pdf_dir = "generated_pdfs"
        if not os.path.exists(pdf_dir):
            os.makedirs(pdf_dir)
        
        # Set default PDF filename if not provided
        if pdf_filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pdf_filename = f"barcode_collection_{timestamp}.pdf"
        
        pdf_path = os.path.join(pdf_dir, pdf_filename)
        
        # Get all PNG files from the barcode directory
        barcode_files = glob.glob(os.path.join(self.output_dir, "*.png"))
        barcode_files.sort()  # Sort for consistent ordering
        
        if not barcode_files:
            print("❌ No barcode images found to include in PDF")
            return None
        
        print(f"📄 Creating PDF with {len(barcode_files)} barcode images...")
        print(f"📁 PDF will be saved as: {pdf_path}")
        
        # Create PDF canvas
        c = canvas.Canvas(pdf_path, pagesize=A4)
        page_width, page_height = A4
        
        # Calculate grid dimensions
        margin = 20  # Margin from page edges
        available_width = page_width - (2 * margin)
        available_height = page_height - (2 * margin)
        
        # Calculate cell dimensions
        cell_width = available_width / grid_cols
        cell_height = available_height / grid_rows
        
        # Calculate image size (leave some padding in each cell)
        image_padding = 5
        image_width = cell_width - (2 * image_padding)
        image_height = cell_height - (2 * image_padding)
        
        # Process images in batches of grid_cols * grid_rows
        images_per_page = grid_cols * grid_rows
        total_pages = (len(barcode_files) + images_per_page - 1) // images_per_page
        
        for page_num in range(total_pages):
            if page_num > 0:
                c.showPage()  # Start new page
            
            # Calculate which images to include on this page
            start_idx = page_num * images_per_page
            end_idx = min(start_idx + images_per_page, len(barcode_files))
            page_images = barcode_files[start_idx:end_idx]
            
            print(f"📄 Processing page {page_num + 1}/{total_pages} ({len(page_images)} images)")
            
            # Place images in grid
            for i, image_path in enumerate(page_images):
                # Calculate grid position
                row = i // grid_cols
                col = i % grid_cols
                
                # Calculate position on page
                x = margin + (col * cell_width) + image_padding
                y = page_height - margin - ((row + 1) * cell_height) + image_padding
                
                try:
                    # Add image to PDF
                    c.drawImage(ImageReader(image_path), x, y, 
                              width=image_width, height=image_height, 
                              preserveAspectRatio=True, anchor='sw')
                except Exception as e:
                    print(f"⚠️  Warning: Could not add image {os.path.basename(image_path)}: {e}")
        
        # Save the PDF
        c.save()
        
        print(f"✅ PDF created successfully: {pdf_path}")
        print(f"📊 Total images included: {len(barcode_files)}")
        print(f"📄 Total pages: {total_pages}")
        print(f"📐 Grid layout: {grid_cols} columns × {grid_rows} rows")
        
        return pdf_path
    
    def generate_from_data(self, data_source):
        """Generate barcodes from CSV, Excel, or dictionary data"""
        
        if isinstance(data_source, str):
            # Read from file (CSV or Excel)
            if not os.path.exists(data_source):
                print(f"Error: File {data_source} not found")
                return
            
            try:
                # Check file extension to determine format
                file_extension = data_source.lower().split('.')[-1]
                
                if file_extension in ['xlsx', 'xls']:
                    # Read Excel file
                    df = pd.read_excel(data_source)
                    print(f"✅ Successfully loaded Excel file: {data_source}")
                elif file_extension == 'csv':
                    # Read CSV file
                df = pd.read_csv(data_source)
                    print(f"✅ Successfully loaded CSV file: {data_source}")
                else:
                    print(f"Error: Unsupported file format. Please use .csv, .xlsx, or .xls files")
                    return
                    
            except Exception as e:
                print(f"Error reading file: {e}")
                return
        
        elif isinstance(data_source, dict):
            # Convert dictionary to DataFrame
            df = pd.DataFrame([data_source])
        
        elif isinstance(data_source, list):
            # Convert list of dictionaries to DataFrame
            df = pd.DataFrame(data_source)
        
        else:
            print("Error: Unsupported data source format")
            return
        
        # Generate labels for each row
        generated_files = []
        
        for index, row in df.iterrows():
            try:
                # Extract data from row - updated for new format
                imei = str(row.get('imei', row.get('IMEI/SN', row.get('IMEI', ''))))
                box_id = str(row.get('box_id', row.get('Box ID', row.get('Boxid', ''))))
                model = str(row.get('model', row.get('Model', 'Unknown')))
                
                # Extract color from Product column if available, otherwise use color column
                product_string = str(row.get('product', row.get('Product', '')))
                if product_string and product_string != 'nan':
                    color = self.extract_color_from_product(product_string)
                else:
                color = str(row.get('color', row.get('Color', 'Unknown Color')))
                
                dn = str(row.get('dn', row.get('DN', 'M8N7')))
                
                if not imei or imei == 'nan':
                    print(f"Skipping row {index}: No IMEI found")
                    continue
                
                # Generate barcode label with new format
                label = self.create_barcode_label(
                    imei=imei,
                    box_id=box_id,
                    model=model,
                    color=color,
                    dn=dn
                )
                
                # Save the label
                filename = f"barcode_label_{imei}_{index+1}.png"
                filepath = os.path.join(self.output_dir, filename)
                label.save(filepath, 'PNG', dpi=(300, 300))
                generated_files.append(filepath)
                
                print(f"Generated: {filename}")
                
            except Exception as e:
                print(f"Error generating label for row {index}: {e}")
        
        print(f"\nGenerated {len(generated_files)} barcode labels in '{self.output_dir}' directory")
        return generated_files

def generate_barcode_set():
    """Generate one set of 3 barcodes using data from the document"""
    
    # Data from your document - first 3 entries
    barcode_set = [
        {
            'imei': '359827134443046',
            'box_id': '355760833587361', 
            'model': 'X6525D',
            'color': 'TIMBER BLACK',
            'dn': 'M8N7'
        },
        {
            'imei': '359827134448540',
            'box_id': '355760834629202',
            'model': 'X6525D', 
            'color': 'TIMBER BLACK',
            'dn': 'M8N7'
        },
        {
            'imei': '359827134450389',
            'box_id': '355760835671043',
            'model': 'X6525D',
            'color': 'TIMBER BLACK', 
            'dn': 'M8N7'
        }
    ]
    
    # Initialize generator
    generator = BarcodeGenerator()
    
    print("Generating Barcode Set (3 barcodes)...")
    print("=" * 50)
    
    generated_files = []
    
    for i, data in enumerate(barcode_set, 1):
        try:
            # Generate barcode label
            label = generator.create_barcode_label(
                imei=data['imei'],
                box_id=data['box_id'],
                model=data['model'],
                color=data['color'],
                dn=data['dn']
            )
            
            # Save the label
            filename = f"barcode_set1_{i}_{data['model']}_{data['imei']}.png"
            filepath = os.path.join(generator.output_dir, filename)
            label.save(filepath, 'PNG', dpi=(300, 300))
            generated_files.append(filepath)
            
            print(f"✅ Generated barcode {i}/3: {filename}")
            print(f"   Model: {data['model']} - {data['color']}")
            print(f"   imei: {data['imei']}")
            print(f"   box_id: {data['box_id']}")
            print("")
            
        except Exception as e:
            print(f"❌ Error generating barcode {i}: {e}")
    
    print(f"✅ Generated {len(generated_files)} barcodes successfully!")
    print(f"📁 Files saved in: {generator.output_dir}")
    
    return generated_files

def create_pdf_from_existing_barcodes(pdf_filename=None, grid_cols=5, grid_rows=12):
    """Create a PDF from existing barcode images in the generated_barcodes folder"""
    
    generator = BarcodeGenerator()
    pdf_path = generator.create_pdf_from_barcodes(pdf_filename, grid_cols, grid_rows)
    
    if pdf_path:
        print("=" * 60)
        print("🎉 PDF GENERATION COMPLETE!")
        print(f"📁 PDF saved in: generated_pdfs/")
        print(f"📄 File: {os.path.basename(pdf_path)}")
    
    return pdf_path

def generate_from_excel_file(excel_file_path):
    """Generate barcodes from an Excel file"""
    
    if not os.path.exists(excel_file_path):
        print(f"❌ Error: Excel file '{excel_file_path}' not found")
        return []
    
    print(f"📊 Loading barcode data from Excel file: {excel_file_path}")
    print("=" * 60)
    
    # Initialize generator
    generator = BarcodeGenerator()
    
    # Generate barcodes from Excel file
    generated_files = generator.generate_from_data(excel_file_path)
    
    if generated_files:
        print("=" * 60)
        print("🎉 COMPLETE!")
        print(f"✅ Generated {len(generated_files)} barcodes from Excel file")
        print("📁 Files saved in: generated_barcodes")
        print("Each label includes:")
        print("  • Complete product information at the top")
        print("  • 2D barcode for IMEI")
        print("  • QR code for IMEI data")
        print("  • 2D barcode for Box ID")
        print("  • High-resolution 300 DPI output")
        
        # Automatically create PDF after generating barcodes
        print("\n📄 Creating PDF with all generated barcodes...")
        pdf_path = generator.create_pdf_from_barcodes()
        if pdf_path:
            print(f"✅ PDF created: {os.path.basename(pdf_path)}")
    
    return generated_files

def create_sample_excel_template():
    """Create a sample Excel template for barcode generation"""
    
    sample_data = [
        {
            'imei': '359827134443046',
            'box_id': '355760833587361', 
            'model': 'X6525D',
            'product': 'SMART 8 64+3 SHINY GOLD',
            'dn': 'M8N7'
        },
        {
            'imei': '359827134448540',
            'box_id': '355760834629202',
            'model': 'X6525D', 
            'product': 'HOT 60 Pro+ 256+8 SLEEK BLACK',
            'dn': 'M8N7'
        },
        {
            'imei': '359827134450389',
            'box_id': '355760835671043',
            'model': 'X6525D',
            'product': 'SMART 10 64+3 MISTY VIOLET', 
            'dn': 'M8N7'
        }
    ]
    
    # Create DataFrame
    df = pd.DataFrame(sample_data)
    
    # Save as Excel file
    template_filename = "barcode_template.xlsx"
    df.to_excel(template_filename, index=False, sheet_name='Barcode Data')
    
    print(f"📋 Created sample Excel template: {template_filename}")
    print("📝 Template includes the following columns:")
    print("  • imei: IMEI/Serial number")
    print("  • box_id: Box ID number")
    print("  • model: Product model (e.g., X6525D)")
    print("  • product: Full product description (e.g., 'SMART 8 64+3 SHINY GOLD')")
    print("    - Color will be automatically extracted from this column")
    print("  • dn: D/N number (e.g., M8N7)")
    print("")
    print("💡 To use this template:")
    print("  1. Edit the Excel file with your data")
    print("  2. Run: python MAIN.PY --excel barcode_template.xlsx")
    
    return template_filename

def main():
    import sys
    
    print("🏷️  Infinix Barcode Generator - Updated Format")
    print("=" * 60)
    
    # Check for command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "--excel" and len(sys.argv) > 2:
            # Generate from Excel file
            excel_file = sys.argv[2]
            files = generate_from_excel_file(excel_file)
            return files
        elif sys.argv[1] == "--template":
            # Create sample template
            template_file = create_sample_excel_template()
            return [template_file]
        elif sys.argv[1] == "--pdf":
            # Create PDF from existing barcodes
            pdf_path = create_pdf_from_existing_barcodes()
            return [pdf_path] if pdf_path else []
        elif sys.argv[1] == "--help":
            print("Usage:")
            print("  python MAIN.PY                    # Generate default 3 barcodes")
            print("  python MAIN.PY --excel file.xlsx  # Generate from Excel file")
            print("  python MAIN.PY --template         # Create sample Excel template")
            print("  python MAIN.PY --pdf              # Create PDF from existing barcodes")
            print("  python MAIN.PY --help             # Show this help")
            return []
    
    # Default: Generate the barcode set
    print("Generating 1 set of 3 barcodes with the updated format:")
    print("  📋 Model + Product at the top")
    print("  📊 2D barcode for IMEI")
    print("  🔲 QR code for IMEI data")  
    print("  📊 2D barcode for Box ID")
    print("  ⭕ Circle with 'A' marking")
    print("")
    
    # Generate the barcode set
    files = generate_barcode_set()
    
    print("=" * 60)
    print("🎉 COMPLETE!")
    print("Your updated barcodes are ready for printing.")
    print("Each label now includes:")
    print("  • Complete product information at the top")
    print("  • Dual barcode system for IMEI tracking")
    print("  • Dual barcode system for Box ID tracking")
    print("  • High-resolution 300 DPI output")
    print("")
    print("💡 To use Excel files:")
    print("  python MAIN.PY --template  # Create sample template")
    print("  python MAIN.PY --excel your_file.xlsx  # Generate from Excel")
    
    return files

if __name__ == "__main__":
    # Check if required packages are available
    required_packages = ['pandas', 'pillow', 'qrcode', 'python-barcode']
    
    print("Required packages:")
    for package in required_packages:
        print(f"  - {package}")
    
    print("\nTo install required packages, run:")
    print("pip install pandas pillow qrcode[pil] python-barcode")
    print("\n" + "="*50)
    
    main()