'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, TrendingUp, AlertCircle } from 'lucide-react'

interface Concurso {
  id: string
  titulo: string
  orgao: string
  data_publicacao: string
  data_fim_inscricoes: string
  vagas: Array<{
    salario: number
    numero_vagas: number
  }>
}

export default function Dashboard() {
  const [concursosRecentes, setConcursosRecentes] = useState<Concurso[]>([])
  const [concursosEncerrando, setConcursosEncerrando] = useState<Concurso[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchData() {
      try {
        // Buscar concursos recentes
        const recentesRes = await fetch('/api/concursos?status=aberto&page=1')
        const recentesData = await recentesRes.json()
        setConcursosRecentes(recentesData.data || [])
        
        // Buscar concursos encerrando em breve
        const encerrandoRes = await fetch('/api/concursos/encerrando')
        const encerrandoData = await encerrandoRes.json()
        setConcursosEncerrando(encerrandoData || [])
        
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  if (loading) {    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }
  
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Acompanhe os concursos mais importantes</p>
        </div>
        
        {/* Concursos da Semana */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Concursos da Semana</h2>
            </div>
            <Link href="/pesquisa" className="text-sm text-primary-600 hover:text-primary-700">
              Ver todos
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {concursosRecentes.slice(0, 3).map((concurso) => (
              <Link
                key={concurso.id}
                href={`/concursos/${concurso.id}`}
                className="block p-5 bg-white rounded-xl border border-gray-200 hover:shadow-soft transition-all hover:border-primary-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                    NOVO
                  </span>
                  <button className="text-gray-400 hover:text-gray-600">
                    {/* Bookmark icon */}
                  </button>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1">{concurso.titulo}</h3>
                <p className="text-sm text-gray-600 mb-4">{concurso.orgao}</p>
                
                <div className="flex items-center justify-between text-sm">                  <span className="text-gray-500">
                    Vagas: {concurso.vagas?.[0]?.numero_vagas || 'N/A'}
                  </span>
                  <span className="font-semibold text-primary-600">
                    R$ {concurso.vagas?.[0]?.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
        
        {/* Inscrições Encerrando */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-warning" />
            <h2 className="text-lg font-semibold text-gray-900">Inscrições Encerrando</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {concursosEncerrando.slice(0, 2).map((concurso) => {
              const diasRestantes = Math.ceil(
                (new Date(concurso.data_fim_inscricoes).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
              )
              
              return (
                <Link
                  key={concurso.id}
                  href={`/concursos/${concurso.id}`}
                  className="block p-5 bg-white rounded-xl border-l-4 border-warning hover:shadow-soft transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-warning" />
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                      Faltam {diasRestantes} {diasRestantes === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">{concurso.titulo}</h3>
                  <p className="text-sm text-gray-600">{concurso.orgao}</p>
                </Link>
              )
            })}
          </div>
        </section>
        
        {/* Últimos Adicionados */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Últimos Adicionados</h2>
                    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
            {concursosRecentes.map((concurso) => (
              <Link
                key={concurso.id}
                href={`/concursos/${concurso.id}`}
                className="flex items-center justify-between p-5 hover:bg-gray-50 transition-all"
              >
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{concurso.titulo}</h3>
                  <p className="text-sm text-gray-600">
                    {concurso.orgao} • Banca: {concurso.banca_organizadora}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-primary-600">
                    R$ {concurso.vagas?.[0]?.salario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">
                    Até {new Date(concurso.data_fim_inscricoes).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  )
}
