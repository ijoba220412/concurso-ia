'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Layout from '@/components/Layout'
import { 
  Calendar, 
  DollarSign, 
  MapPin, 
  Users, 
  Clock, 
  GraduationCap,
  FileText,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface Concurso {
  id: string
  titulo: string
  orgao: string
  banca_organizadora: string
  data_publicacao: string
  data_inicio_inscricoes: string
  data_fim_inscricoes: string
  data_prova: string
  valor_taxa_inscricao: number
  link_edital_original: string
  resumo_ia: string
  vagas: Array<{
    id: string
    cargo: string
    local_atuacao: string
    numero_vagas: number
    salario: number
    carga_horaria: number
    nivel_escolaridade: string
    formacao_exigida: string
    exige_prova_titulos: boolean
    materias: Array<{
      id: string
      nome_materia: string
      topicos: string
      peso_prova: number
    }>
  }>
}
export default function ConcursoDetalhes() {
  const params = useParams()
  const [concurso, setConcurso] = useState<Concurso | null>(null)
  const [loading, setLoading] = useState(true)
  const [inscrito, setInscrito] = useState(false)
  const [anotacoes, setAnotacoes] = useState('')
  const [expandedMaterias, setExpandedMaterias] = useState<Record<string, boolean>>({})
  const [vagaSelecionada, setVagaSelecionada] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchConcurso() {
      try {
        const response = await fetch(`/api/concursos/${params.id}`)
        const data = await response.json()
        setConcurso(data)
        
        // Verificar se já está inscrito
        const inscricoesRes = await fetch('/api/inscricoes')
        const inscricoes = await inscricoesRes.json()
        const vagaInscrita = inscricoes.find((i: any) => i.vaga_id === data.vagas[0]?.id)
        if (vagaInscrita) {
          setInscrito(vagaInscrita.inscrito)
          setAnotacoes(vagaInscrita.anotacoes_pessoais || '')
        }
      } catch (error) {
        console.error('Erro ao carregar concurso:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchConcurso()
  }, [params.id])
  
  const handleInscricao = async () => {
    try {
      const response = await fetch('/api/inscricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaga_id: vagaSelecionada || concurso?.vagas[0]?.id,
          inscrito: !inscrito,
          anotacoes_pessoais: anotacoes
        })
      })
      
      if (response.ok) {
        setInscrito(!inscrito)
      }    } catch (error) {
      console.error('Erro ao salvar inscrição:', error)
    }
  }
  
  const handleSaveAnotacoes = async () => {
    try {
      await fetch('/api/inscricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaga_id: vagaSelecionada || concurso?.vagas[0]?.id,
          inscrito,
          anotacoes_pessoais: anotacoes
        })
      })
      alert('Anotações salvas!')
    } catch (error) {
      console.error('Erro ao salvar anotações:', error)
    }
  }
  
  const toggleMateria = (materiaId: string) => {
    setExpandedMaterias(prev => ({
      ...prev,
      [materiaId]: !prev[materiaId]
    }))
  }
  
  const diasRestantes = concurso 
    ? Math.ceil((new Date(concurso.data_fim_inscricoes).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }
  
  if (!concurso) {
    return (
      <Layout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Concurso não encontrado</h2>
        </div>      </Layout>
    )
  }
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  Edital Aberto
                </span>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                  Nível {concurso.vagas[0]?.nivel_escolaridade}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{concurso.titulo}</h1>
              <p className="text-lg text-gray-600 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {concurso.orgao}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Banca Organizadora</p>
              <p className="font-semibold text-gray-900">{concurso.banca_organizadora}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Gerais */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                Informações Gerais
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Inscrições</span>
                  </div>
                  <p className="font-medium text-gray-900">                    {new Date(concurso.data_inicio_inscricoes).toLocaleDateString('pt-BR')} a{' '}
                    {new Date(concurso.data_fim_inscricoes).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Data da Prova</span>
                  </div>
                  <p className="font-medium text-gray-900">
                    {concurso.data_prova ? new Date(concurso.data_prova).toLocaleDateString('pt-BR') : 'A definir'}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">Taxa</span>
                  </div>
                  <p className="font-medium text-gray-900">
                    R$ {concurso.valor_taxa_inscricao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                {concurso.link_edital_original && (
                  <a
                    href={concurso.link_edital_original}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    Ler Edital Completo
                  </a>
                )}
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-all">
                  <ExternalLink className="w-4 h-4" />
                  Site da Banca
                </button>
              </div>
            </section>
            
            {/* Vagas Disponíveis */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                Vagas Disponíveis              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cargo</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Localidade</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Remuneração</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Vagas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {concurso.vagas.map((vaga) => (
                      <tr 
                        key={vaga.id} 
                        className={`cursor-pointer hover:bg-gray-50 ${vagaSelecionada === vaga.id ? 'bg-primary-50' : ''}`}
                        onClick={() => setVagaSelecionada(vaga.id)}
                      >
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{vaga.cargo}</p>
                          <p className="text-sm text-gray-600">{vaga.formacao_exigida}</p>
                        </td>
                        <td className="py-4 px-4 text-gray-600">{vaga.local_atuacao}</td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-success">
                            R$ {vaga.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                            {vaga.numero_vagas}
                          </span>
                          {vaga.exige_prova_titulos && (
                            <span className="ml-2 text-xs text-gray-500">+ CR</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            
            {/* O que Estudar */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary-600" />
                  O que Estudar                </h2>
                <button className="text-sm text-primary-600 hover:text-primary-700">
                  Expandir todos
                </button>
              </div>
              
              <div className="space-y-2">
                {concurso.vagas
                  .find(v => v.id === vagaSelecionada || v.id === concurso.vagas[0]?.id)
                  ?.materias.map((materia) => (
                    <div key={materia.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleMateria(materia.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                          <span className="font-medium text-gray-900">{materia.nome_materia}</span>
                          {materia.peso_prova && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Peso {materia.peso_prova}
                            </span>
                          )}
                        </div>
                        {expandedMaterias[materia.id] ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      
                      {expandedMaterias[materia.id] && (
                        <div className="px-4 pb-4 pl-9">
                          <div className="text-sm text-gray-600 space-y-1">
                            {materia.topicos.split(',').map((topico, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                                <span>{topico.trim()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          </div>
          
          {/* Sidebar */}          <div className="space-y-6">
            {/* Progresso */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className={`w-8 h-8 ${inscrito ? 'text-success' : 'text-primary-600'}`} />
                </div>
                <h3 className="font-semibold text-gray-900">Acompanhe seu progresso</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Marque se você já realizou a inscrição para este certame.
                </p>
              </div>
              
              <button
                onClick={handleInscricao}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                  inscrito
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-success text-white hover:bg-success/90'
                }`}
              >
                {inscrito ? '✓ Já me inscrevi' : 'Marcar como inscrito'}
              </button>
              
              <button className="w-full mt-3 py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all">
                Adicionar ao Plano de Estudos
              </button>
            </section>
            
            {/* Anotações Pessoais */}
            <section className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                Anotações Pessoais
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Guarde links úteis, resumos ou lembretes sobre este concurso.
              </p>
              
              <textarea
                value={anotacoes}
                onChange={(e) => setAnotacoes(e.target.value)}
                placeholder="Ex: Focar em dir. administrativo nas próximas semanas..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{anotacoes.length}/500</span>
                <button
                  onClick={handleSaveAnotacoes}                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Salvar nota
                </button>
              </div>
            </section>
            
            {/* Contagem Regressiva */}
            {diasRestantes > 0 && (
              <section className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 p-6">
                <p className="text-sm text-primary-800 font-medium mb-1">FALTAM PARA A PROVA</p>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-bold text-primary-600">{diasRestantes} dias</p>
                  <Clock className="w-10 h-10 text-primary-400" />
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
