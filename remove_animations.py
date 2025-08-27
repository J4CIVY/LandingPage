#!/usr/bin/env python3
import os
import re

# Directorio a procesar
home_dir = "/workspaces/LandingPage/components/home"

# Archivos que necesitan procesamiento
files_to_process = [
    "EventsSection.tsx",
    "GallerySection.tsx", 
    "FAQSection.tsx",
    "HermandadSection.tsx",
    "StoreSection.tsx"
]

def remove_animations_from_file(file_path):
    """Remueve las animaciones de un archivo TSX"""
    print(f"Procesando: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    
    # Remover imports de animaciones
    content = re.sub(r'import\s*{[^}]*}\s*from\s*["\']@/components/animations/.*?["\'];\s*\n?', '', content)
    
    # Reemplazar AnimatedHeading con función personalizada
    def replace_animated_heading(match):
        full_match = match.group(0)
        # Extraer level
        level_match = re.search(r'level={(\d+)}', full_match)
        # Extraer className
        class_match = re.search(r'className="([^"]*)"', full_match)
        
        if level_match and class_match:
            level = level_match.group(1)
            class_name = class_match.group(1)
            return f'<h{level} className="{class_name}">'
        elif class_match:
            class_name = class_match.group(1)
            return f'<h2 className="{class_name}">'  # Default to h2
        else:
            return '<h2>'
    
    content = re.sub(r'<AnimatedHeading[^>]*>', replace_animated_heading, content)
    content = re.sub(r'</AnimatedHeading>', '</h2>', content)  # Simplificado a h2
    
    # Reemplazar AnimatedParagraph con p
    content = re.sub(r'<AnimatedParagraph[^>]*className="([^"]*)"[^>]*>', r'<p className="\1">', content)
    content = re.sub(r'<AnimatedParagraph[^>]*>', r'<p>', content)
    content = re.sub(r'</AnimatedParagraph>', r'</p>', content)
    
    # Reemplazar AnimatedText con div
    content = re.sub(r'<AnimatedText[^>]*className="([^"]*)"[^>]*>', r'<div className="\1">', content)
    content = re.sub(r'<AnimatedText[^>]*>', r'<div>', content)
    content = re.sub(r'</AnimatedText>', r'</div>', content)
    
    # Reemplazar AnimatedButton con button
    content = re.sub(r'<AnimatedButton([^>]*)>', r'<button\1>', content)
    content = re.sub(r'</AnimatedButton>', r'</button>', content)
    
    # Reemplazar AnimatedPrimaryButton, AnimatedOutlineButton, AnimatedGhostButton
    content = re.sub(r'<Animated(Primary|Outline|Ghost)Button([^>]*)>', r'<button\2>', content)
    content = re.sub(r'</Animated(Primary|Outline|Ghost)Button>', r'</button>', content)
    
    # Limpiar atributos específicos de animación
    content = re.sub(r'\s*animationType="[^"]*"', '', content)
    content = re.sub(r'\s*delay={\d+}', '', content)
    content = re.sub(r'\s*variant="[^"]*"', '', content)
    content = re.sub(r'\s*level={\d+}', '', content)
    
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Animaciones removidas de: {file_path}")
    else:
        print(f"ℹ️  No se encontraron animaciones en: {file_path}")

def main():
    for file_name in files_to_process:
        file_path = os.path.join(home_dir, file_name)
        if os.path.exists(file_path):
            remove_animations_from_file(file_path)
        else:
            print(f"❌ Archivo no encontrado: {file_path}")

if __name__ == "__main__":
    main()
