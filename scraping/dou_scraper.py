import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import re
import os
from supabase import create_client, Client
from google import genai
import json

# Configurações
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client = genai.Client(api_key=GEMINI_API_KEY)

def buscar_dou():
    """Busca publicações do Diário Oficial da União"""
    url = "https://www.in.gov.br/leiturajornal"
    
    params = {
        'data': datetime.now().strftime('%d-%m-%Y'),
        'pagina': 1
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'lxml')
        
        publicacoes = []
        
        # Ajustar seletores conforme estrutura real do DOU
        for item in soup.find_all('div', class_='content'):
            texto = item.get_text(strip=True)
            if texto and len(texto) > 100:  # Filtra textos relevantes
                publicacoes.append(texto)
        
        return publicacoes
    
    except Exception as e:
        print(f"Erro ao buscar DOU: {e}")
        return []

def analisar_com_ia(texto: str) -> dict:    """Usa Google Gemini para extrair dados do concurso"""
    
    prompt = f"""
Analise este texto do Diário Oficial da União e extraia informações sobre concursos públicos.

Texto:
{texto[:3000]}

Retorne APENAS um JSON válido no seguinte formato (se não for concurso, retorne null):

{{
  "eh_concurso": true/false,
  "titulo": "Título do concurso",
  "orgao": "Órgão/instituição",
  "banca_organizadora": "Nome da banca",
  "numero_edital": "Número do edital",
  "data_publicacao": "YYYY-MM-DD",
  "data_inicio_inscricoes": "YYYY-MM-DD",
  "data_fim_inscricoes": "YYYY-MM-DD",
  "data_prova": "YYYY-MM-DD",
  "valor_taxa_inscricao": 0.00,
  "link_edital": "URL se houver",
  "vagas": [
    {{
      "cargo": "Nome do cargo",
      "local_atuacao": "Cidade/Estado",
      "numero_vagas": 0,
      "salario": 0.00,
      "carga_horaria": 0.00,
      "nivel_escolaridade": "médio|superior|pós-graduação",
      "formacao_exigida": "Descrição da formação",
      "exige_prova_titulos": false
    }}
  ],
  "materias": [
    {{
      "vaga_cargo": "Nome do cargo relacionado",
      "nome_materia": "Nome da matéria",
      "topicos": "Lista de tópicos separados por vírgula",
      "peso_prova": 1.0
    }}
  ]
}}

Se não for um concurso público, retorne apenas: {{"eh_concurso": false}}
"""
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp",            contents=prompt
        )
        
        # Extrair JSON da resposta
        texto_response = response.text.strip()
        
        # Remover markdown se houver
        if texto_response.startswith('```'):
            texto_response = re.sub(r'^```[a-z]*\n|\n```$', '', texto_response)
        
        dados = json.loads(texto_response)
        
        if dados.get('eh_concurso'):
            return dados
        else:
            return None
    
    except Exception as e:
        print(f"Erro na análise com IA: {e}")
        return None

def salvar_no_banco(dados: dict):
    """Salva os dados extraídos no Supabase"""
    
    try:
        # Inserir concurso
        concurso_data = {
            'titulo': dados['titulo'],
            'orgao': dados['orgao'],
            'banca_organizadora': dados['banca_organizadora'],
            'numero_edital': dados.get('numero_edital'),
            'data_publicacao': dados['data_publicacao'],
            'data_inicio_inscricoes': dados.get('data_inicio_inscricoes'),
            'data_fim_inscricoes': dados['data_fim_inscricoes'],
            'data_prova': dados.get('data_prova'),
            'valor_taxa_inscricao': dados.get('valor_taxa_inscricao'),
            'link_edital_original': dados.get('link_edital'),
            'resumo_ia': f"Concurso {dados['titulo']} - {dados['orgao']}",
            'status': 'aberto'
        }
        
        result = supabase.table('concursos').insert(concurso_data).execute()
        concurso_id = result.data[0]['id']
        
        # Inserir vagas
        for vaga_data in dados.get('vagas', []):
            vaga_data['concurso_id'] = concurso_id
            vaga_result = supabase.table('vagas').insert(vaga_data).execute()
            vaga_id = vaga_result.data[0]['id']
                        # Inserir matérias relacionadas à vaga
            for materia in dados.get('materias', []):
                if materia.get('vaga_cargo') == vaga_data['cargo']:
                    materia_data = {
                        'vaga_id': vaga_id,
                        'nome_materia': materia['nome_materia'],
                        'topicos': materia['topicos'],
                        'peso_prova': materia.get('peso_prova')
                    }
                    supabase.table('materias').insert(materia_data).execute()
        
        print(f"Concurso {dados['titulo']} salvo com sucesso!")
        return concurso_id
    
    except Exception as e:
        print(f"Erro ao salvar no banco: {e}")
        return None

def verificar_novos_concursos():
    """Verifica e envia alertas para novos concursos"""
    
    # Buscar usuários com alertas ativados
    usuarios = supabase.table('usuarios').select('*').execute()
    
    for usuario in usuarios.data:
        if usuario.get('telefone_whatsapp'):
            # Buscar concursos publicados nas últimas 24h
            concursos = supabase.table('concursos')\
                .select('*')\
                .gte('data_publicacao', (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d'))\
                .eq('status', 'aberto')\
                .execute()
            
            for concurso in concursos.data:
                mensagem = f" Novo Concurso Public!\n\n"
                mensagem += f"📋 {concurso['titulo']}\n"
                mensagem += f"🏛️ {concurso['orgao']}\n"
                mensagem += f"📅 Inscrições até: {concurso['data_fim_inscricoes']}\n"
                mensagem += f"\nAcesse: {os.getenv('APP_URL')}"
                
                # Salvar alerta
                supabase.table('alertas_whatsapp').insert({
                    'usuario_id': usuario['id'],
                    'tipo_alerta': 'novo_concurso',
                    'concurso_id': concurso['id'],
                    'mensagem_enviada': mensagem,
                    'status_envio': 'pendente'
                }).execute()

def main():    """Função principal"""
    print("Iniciando scraping do DOU...")
    
    publicacoes = buscar_dou()
    print(f"{len(publicacoes)} publicações encontradas")
    
    concursos_salvos = 0
    
    for pub in publicacoes:
        dados = analisar_com_ia(pub)
        
        if dados:
            concurso_id = salvar_no_banco(dados)
            if concurso_id:
                concursos_salvos += 1
    
    print(f"{concursos_salvos} concursos salvos")
    
    # Verificar e criar alertas
    verificar_novos_concursos()
    
    print("Processo concluído!")

if __name__ == "__main__":
    main()
