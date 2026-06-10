'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { User, Mail, Phone, Bell, Lock } from 'lucide-react'

export default function Perfil() {
  const [userData, setUserData] = useState({
    nome: '',
    email: '',
    telefone: '',
    foto: null
  })
  const [notificacoes, setNotificacoes] = useState({
    novosConcursos: true,
    lembretePrazo: false
  })
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // Carregar dados do usuário
    async function fetchUserData() {
      // Implementar chamada à API para buscar dados do usuário
      // Por enquanto, dados mockados
      setUserData({
        nome: 'João Silva',
        email: 'joao.silva@email.com',
        telefone: '(11) 98765-4321',
        foto: null
      })
    }
    
    fetchUserData()
  }, [])
  
  const handleSave = async () => {
    setLoading(true)
    try {
      // Implementar salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Dados salvos com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar dados')
    } finally {
      setLoading(false)
    }
  }
  
  const handleLogout = () => {    if (confirm('Deseja realmente encerrar a sessão?')) {
      // Implementar logout
      window.location.href = '/login'
    }
  }
  
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações de Perfil</h1>
          <p className="text-gray-600 mt-1">Gerencie seus dados pessoais e preferências de notificação.</p>
        </div>
        
        {/* Dados Pessoais */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            Dados Pessoais
          </h2>
          
          {/* Foto de Perfil */}
          <div className="flex items-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              {userData.foto ? (
                <img src={userData.foto} alt="Foto" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <div>
              <button className="text-primary-600 hover:text-primary-700 font-medium mb-1">
                Alterar Foto
              </button>
              <p className="text-sm text-gray-500">JPG, GIF ou PNG. Máximo de 2MB.</p>
            </div>
          </div>
          
          {/* Formulário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={userData.nome}                  onChange={(e) => setUserData({ ...userData, nome: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={userData.telefone}
                  onChange={(e) => setUserData({ ...userData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Usado para enviar alertas de novos concursos e prazos
              </p>
            </div>
          </div>
        </section>
        
        {/* Preferências de Notificação */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-600" />
            Preferências de Notificação
          </h2>
          
          <div className="space-y-4">            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Novos concursos da minha área</h3>
                <p className="text-sm text-gray-600">Seja avisado instantaneamente quando um edital for publicado.</p>
              </div>
              <button
                onClick={() => setNotificacoes({ ...notificacoes, novosConcursos: !notificacoes.novosConcursos })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  notificacoes.novosConcursos ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    notificacoes.novosConcursos ? 'left-8' : 'left-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">Lembrete 2 dias antes do encerramento</h3>
                <p className="text-sm text-gray-600">Avisos sobre o fim do prazo de inscrições.</p>
              </div>
              <button
                onClick={() => setNotificacoes({ ...notificacoes, lembretePrazo: !notificacoes.lembretePrazo })}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  notificacoes.lembretePrazo ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    notificacoes.lembretePrazo ? 'left-8' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>
        
        {/* Ações */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handleLogout}
            className="text-danger hover:text-danger/80 text-sm font-medium flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Encerrar sessão de forma segura
          </button>
                    <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}
