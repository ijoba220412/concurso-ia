import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabaseCookie = cookieStore.get('sb-auth-token')?.value
    
    if (!supabaseCookie) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    
    // Extrair user_id do token (simplificado)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    
    const { data } = await supabase
      .from('inscricoes')
      .select(`
        *,
        vagas (
          *,
          concursos (
            titulo,
            orgao
          )
        )
      `)
      .eq('usuario_id', user.id)
    
    return NextResponse.json(data || [])
    
  } catch (error) {
    console.error('Erro ao buscar inscrições:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar inscrições' },
      { status: 500 }
    )
  }
}
export async function POST(request: Request) {
  try {
    const { vaga_id, inscrito, anotacoes_pessoais } = await request.json()
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }
    
    // Verificar se já existe
    const { data: existing } = await supabase
      .from('inscricoes')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('vaga_id', vaga_id)
      .single()
    
    if (existing) {
      // Atualizar
      const { data, error } = await supabase
        .from('inscricoes')
        .update({
          inscrito,
          anotacoes_pessoais,
          atualizado_em: new Date().toISOString()
        })
        .eq('usuario_id', user.id)
        .eq('vaga_id', vaga_id)
        .select()
        .single()
      
      if (error) throw error
      return NextResponse.json(data)
    } else {
      // Criar novo
      const { data, error } = await supabase
        .from('inscricoes')
        .insert({
          usuario_id: user.id,
          vaga_id,
          inscrito,
          anotacoes_pessoais
        })
        .select()
        .single()      
      if (error) throw error
      return NextResponse.json(data)
    }
    
  } catch (error) {
    console.error('Erro ao salvar inscrição:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar inscrição' },
      { status: 500 }
    )
  }
}
