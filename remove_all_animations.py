#!/usr/bin/env python3
import os
import re
import glob

def remove_animations_from_file(file_path):
    """Remueve las animaciones de un archivo TSX"""
    print(f"Procesando: {file_path}")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"❌ Error leyendo {file_path}: {e}")
        return
    
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
        elif level_match:
            level = level_match.group(1)
            return f'<h{level}>'
        else:
            return '<h2>'
    
    content = re.sub(r'<AnimatedHeading[^>]*>', replace_animated_heading, content)
    content = re.sub(r'</AnimatedHeading>', '</h2>', content)  # Simplificado a h2 por defecto
    
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
    
    # Agregar transition-colors a botones que no tengan ninguna clase de transición
    def add_transition_to_button(match):
        button_tag = match.group(0)
        if 'transition' not in button_tag:
            if 'className="' in button_tag:
                return button_tag.replace('className="', 'className="transition-colors ')
            else:
                return button_tag.replace('>', ' className="transition-colors">')
        return button_tag
    
    content = re.sub(r'<button[^>]*>', add_transition_to_button, content)
    
    if content != original_content:
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Animaciones removidas de: {file_path}")
        except Exception as e:
            print(f"❌ Error escribiendo {file_path}: {e}")
    else:
        print(f"ℹ️  No se encontraron animaciones en: {file_path}")

def main():
    # Buscar todos los archivos TSX en app/ y components/
    patterns = [
        "/workspaces/LandingPage/app/**/*.tsx",
        "/workspaces/LandingPage/components/**/*.tsx"
    ]
    
    all_files = []
    for pattern in patterns:
        all_files.extend(glob.glob(pattern, recursive=True))
    
    # Filtrar solo archivos que contengan animaciones
    files_with_animations = []
    for file_path in all_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'Animated' in content and '@/components/animations' in content:
                    files_with_animations.append(file_path)
        except:
            continue
    
    print(f"📁 Encontrados {len(files_with_animations)} archivos con animaciones:")
    for file_path in files_with_animations:
        print(f"   - {file_path}")
    
    print("\n🔄 Procesando archivos...")
    for file_path in files_with_animations:
        remove_animations_from_file(file_path)
    
    print(f"\n✅ Procesamiento completado. Se procesaron {len(files_with_animations)} archivos.")

if __name__ == "__main__":
    main()
