#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para análise e limpeza de código
- Remove duplicidades
- Remove espaços vazios excessivos
- Mantém layout profissional
"""

import os
import re
import codecs
from collections import defaultdict

def analisar_arquivo(filepath):
    """Analisa um arquivo e retorna métricas"""
    with codecs.open(filepath, 'r', 'utf-8', errors='ignore') as f:
        lines = f.readlines()
    
    total_lines = len(lines)
    empty_lines = sum(1 for line in lines if line.strip() == '')
    comment_lines = sum(1 for line in lines if line.strip().startswith(('//','#','/*','*','<!--')))
    code_lines = total_lines - empty_lines - comment_lines
    
    # Detectar múltiplas linhas vazias consecutivas
    consecutive_empty = 0
    max_consecutive = 0
    excessive_empty = 0
    
    for line in lines:
        if line.strip() == '':
            consecutive_empty += 1
            max_consecutive = max(max_consecutive, consecutive_empty)
            if consecutive_empty > 2:
                excessive_empty += 1
        else:
            consecutive_empty = 0
    
    return {
        'total': total_lines,
        'empty': empty_lines,
        'comments': comment_lines,
        'code': code_lines,
        'max_consecutive_empty': max_consecutive,
        'excessive_empty': excessive_empty,
        'empty_percent': round((empty_lines / total_lines * 100), 1) if total_lines > 0 else 0
    }

def limpar_espacos_excessivos(filepath):
    """Remove espaços vazios excessivos mantendo legibilidade"""
    with codecs.open(filepath, 'r', 'utf-8', errors='ignore') as f:
        content = f.read()
    
    original_size = len(content)
    
    # Reduzir múltiplas linhas vazias para no máximo 2
    content = re.sub(r'\n\s*\n\s*\n+', '\n\n\n', content)
    
    # Remover espaços em branco no final das linhas
    content = re.sub(r'[ \t]+$', '', content, flags=re.MULTILINE)
    
    # Remover múltiplos espaços (exceto em strings)
    # content = re.sub(r'  +', ' ', content)
    
    new_size = len(content)
    saved = original_size - new_size
    
    if saved > 0:
        with codecs.open(filepath, 'w', 'utf-8') as f:
            f.write(content)
        return saved
    return 0

def encontrar_funcoes_duplicadas():
    """Encontra funções duplicadas entre modules.js e modules/*.js"""
    modules_js = 'web/static/js/modules.js'
    modules_dir = 'web/static/js/modules/'
    
    duplicates = {}
    
    if not os.path.exists(modules_js):
        return duplicates
    
    with codecs.open(modules_js, 'r', 'utf-8', errors='ignore') as f:
        modules_content = f.read()
    
    # Extrair nomes de funções do modules.js
    functions_in_main = re.findall(r'(?:function|const|let|var)\s+(\w+)\s*(?:=|\()', modules_content)
    
    # Verificar cada arquivo em modules/
    if os.path.exists(modules_dir):
        for filename in os.listdir(modules_dir):
            if filename.endswith('.js'):
                filepath = os.path.join(modules_dir, filename)
                with codecs.open(filepath, 'r', 'utf-8', errors='ignore') as f:
                    module_content = f.read()
                
                module_functions = re.findall(r'(?:function|const|let|var)\s+(\w+)\s*(?:=|\()', module_content)
                
                # Encontrar duplicatas
                common = set(functions_in_main) & set(module_functions)
                if common:
                    duplicates[filename] = list(common)
    
    return duplicates

def main():
    print("="*70)
    print("ANÁLISE DE CÓDIGO - ProjetoWash")
    print("="*70)
    
    # Arquivos para analisar
    arquivos = [
        'web/static/js/app.js',
        'web/static/js/auth.js',
        'web/static/js/modules.js',
        'web/static/js/dashboard.js',
        'web/static/js/local-auth.js',
        'web/static/js/local-firestore.js',
        'web/static/js/pwa.js',
        'web/static/service-worker.js',
        'web/index.html',
        'web/static/css/style.css',
        'app.py'
    ]
    
    print("\n1. MÉTRICAS DE ARQUIVOS")
    print("-"*70)
    
    total_metrics = {
        'total': 0,
        'empty': 0,
        'comments': 0,
        'code': 0,
        'excessive_empty': 0
    }
    
    for arquivo in arquivos:
        if os.path.exists(arquivo):
            metrics = analisar_arquivo(arquivo)
            total_metrics['total'] += metrics['total']
            total_metrics['empty'] += metrics['empty']
            total_metrics['comments'] += metrics['comments']
            total_metrics['code'] += metrics['code']
            total_metrics['excessive_empty'] += metrics['excessive_empty']
            
            print(f"\n{arquivo}:")
            print(f"  Total: {metrics['total']} linhas")
            print(f"  Código: {metrics['code']} linhas ({100-metrics['empty_percent']:.1f}%)")
            print(f"  Vazias: {metrics['empty']} linhas ({metrics['empty_percent']}%)")
            print(f"  Comentários: {metrics['comments']} linhas")
            if metrics['excessive_empty'] > 0:
                print(f"  ⚠️  Espaços excessivos: {metrics['excessive_empty']} linhas (>{metrics['max_consecutive_empty']} consecutivas)")
    
    print("\n" + "-"*70)
    print("TOTAIS:")
    print(f"  Total: {total_metrics['total']} linhas")
    print(f"  Código: {total_metrics['code']} linhas")
    print(f"  Vazias: {total_metrics['empty']} linhas")
    print(f"  Espaços excessivos: {total_metrics['excessive_empty']} linhas")
    
    # Verificar duplicidades
    print("\n2. DUPLICIDADES DETECTADAS")
    print("-"*70)
    
    duplicates = encontrar_funcoes_duplicadas()
    if duplicates:
        print("\n⚠️  CRÍTICO: Funções duplicadas encontradas!")
        for module, functions in duplicates.items():
            print(f"\n{module}:")
            for func in functions[:10]:  # Mostrar apenas primeiras 10
                print(f"  - {func}()")
            if len(functions) > 10:
                print(f"  ... e mais {len(functions)-10} funções")
        
        print("\n💡 RECOMENDAÇÃO:")
        print("  O arquivo modules.js contém código duplicado dos módulos individuais.")
        print("  Considere usar APENAS os módulos em /modules/ e remover de modules.js")
    else:
        print("✅ Nenhuma duplicidade crítica encontrada!")
    
    # Limpeza
    print("\n3. LIMPEZA DE ESPAÇOS EXCESSIVOS")
    print("-"*70)
    
    total_saved = 0
    for arquivo in arquivos:
        if os.path.exists(arquivo):
            saved = limpar_espacos_excessivos(arquivo)
            if saved > 0:
                total_saved += saved
                print(f"✅ {arquivo}: {saved} bytes economizados")
    
    if total_saved > 0:
        print(f"\n✅ Total economizado: {total_saved} bytes ({total_saved/1024:.1f} KB)")
    else:
        print("\n✅ Arquivos já otimizados!")
    
    print("\n" + "="*70)
    print("ANÁLISE CONCLUÍDA")
    print("="*70)

if __name__ == '__main__':
    main()
