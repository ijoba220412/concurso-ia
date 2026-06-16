'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { Search, Filter, X } from 'lucide-react'
import Link from 'next/link'

interface Filtros {
  localidade: string
  salarioMin: string
  salarioMax: string
  escolaridade: string[]
  banca: string
  status: string
}

interface Concurso {
  id: string
  titulo: string
  orgao: string
  banca_organizadora: string
  data_publicacao: string
  data_fim_inscricoes: string
  vagas: Array<{
    id: string
    cargo: string
    local_atuacao: string
    salario: number
    carga_horaria: number
    nivel_escolaridade: string
    numero_vagas: number
  }>
}

export default function Pesquisa() {
  const [searchTerm, setSearchTerm] = useState('')
  const [concursos, setConcursos] = useState<Concurso[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<Filtros>({
    localidade: '',
    salarioMin: '',
    salarioMax: '',
    escolaridade: [],
    banca: '',
    status: 'aberto'
  })
  
  const fetchConcursos = async () => {
    setLoading(true)
    try {      const params = new URLSearchParams({
        page: '1',
        ...(filters.localidade && { localidade: filters.localidade }),
        ...(filters.salarioMin && { salarioMin: filters.salarioMin }),
        ...(filters.salarioMax && { salarioMax: filters.salarioMax }),
        ...(filters.banca && { banca: filters.banca }),
        ...(filters.status && { status: filters.status }),
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await fetch(`/api/concursos?${params}`)
      const data = await response.json()
      setConcursos(data.data || [])
    } catch (error) {
      console.error('Erro ao buscar concursos:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchConcursos()
  }, [filters, searchTerm])
  
  const clearFilters = () => {
    setFilters({
      localidade: '',
      salarioMin: '',
      salarioMax: '',
      escolaridade: [],
      banca: '',
      status: 'aberto'
    })
    setSearchTerm('')
  }
  
  const toggleEscolaridade = (nivel: string) => {
    if (filters.escolaridade.includes(nivel)) {
      setFilters({
        ...filters,
        escolaridade: filters.escolaridade.filter(n => n !== nivel)
      })
    } else {
      setFilters({
        ...filters,
        escolaridade: [...filters.escolaridade, nivel]
      })
    }
  }
    return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pesquisa de Concursos</h1>
          <p className="text-gray-600 mt-1">Encontre a oportunidade ideal baseada no seu perfil</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cargo, órgão, matéria ou palavra-chave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h2 className="font-semibold text-gray-900">Filtros</h2>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Limpar
                </button>
              </div>
              
              {/* Localidade */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localidade
                </label>
                <select
                  value={filters.localidade}
                  onChange={(e) => setFilters({ ...filters, localidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Todo o Brasil</option>
                  <option value="SP">São Paulo</option>                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="PR">Paraná</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="BA">Bahia</option>
                  <option value="PE">Pernambuco</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="GO">Goiás</option>
                  <option value="PA">Pará</option>
                  <option value="AM">Amazonas</option>
                </select>
              </div>
              
              {/* Faixa Salarial */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faixa Salarial
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={filters.salarioMin}
                    onChange={(e) => setFilters({ ...filters, salarioMin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={filters.salarioMax}
                    onChange={(e) => setFilters({ ...filters, salarioMax: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              {/* Nível de Escolaridade */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Escolaridade
                </label>
                <div className="space-y-2">
                  {['Médio', 'Superior', 'Pós-Graduação'].map((nivel) => (
                    <label key={nivel} className="flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        checked={filters.escolaridade.includes(nivel)}                        onChange={() => toggleEscolaridade(nivel)}
                      />
                      <span className="ml-2 text-sm text-gray-700">{nivel}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Banca Organizadora */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banca Organizadora
                </label>
                <select
                  value={filters.banca}
                  onChange={(e) => setFilters({ ...filters, banca: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Qualquer Banca</option>
                  <option value="Cebraspe">Cebraspe</option>
                  <option value="FGV">FGV</option>
                  <option value="Vunesp">Vunesp</option>
                  <option value="Cesgranrio">Cesgranrio</option>
                  <option value="FCC">FCC</option>
                  <option value="IBFC">IBFC</option>
                </select>
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status do Edital
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="aberto"
                      checked={filters.status === 'aberto'}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Aberto</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="previsto"                      checked={filters.status === 'previsto'}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Previsto</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>
          
          {/* Results */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                <strong>{concursos.length}</strong> resultados encontrados
              </p>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                <option>Ordenar por: Relevância</option>
                <option>Maior Salário</option>
                <option>Menor Salário</option>
                <option>Prazo mais próximo</option>
              </select>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : concursos.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum concurso encontrado
                </h3>
                <p className="text-gray-600">
                  Tente ajustar os filtros ou buscar por outros termos.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {concursos.map((concurso) => (
                  <Link
                    key={concurso.id}
                    href={`/concursos/${concurso.id}`}
                    className="block p-5 bg-white rounded-xl border border-gray-200 hover:shadow-soft transition-all hover:border-primary-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">                          {concurso.vagas?.[0]?.cargo || concurso.titulo}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">{concurso.orgao}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          <span>📍 {concurso.vagas?.[0]?.local_atuacao || 'Nacional'}</span>
                          <span>🎓 {concurso.vagas?.[0]?.nivel_escolaridade || 'N/A'}</span>
                          <span>⏰ {concurso.vagas?.[0]?.carga_horaria || 'N/A'}h/sem</span>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <p className="text-lg font-semibold text-primary-600">
                          R$ {concurso.vagas?.[0]?.salario?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-danger font-medium">
                          Até {new Date(concurso.data_fim_inscricoes).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Banca: {concurso.banca_organizadora}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </Layout>
  )
}