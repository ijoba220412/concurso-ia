import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 10
    
    // Filtros
    const localidade = searchParams.get('localidade')
    const salarioMin = searchParams.get('salarioMin')
    const salarioMax = searchParams.get('salarioMax')
    const escolaridade = searchParams.get('escolaridade')
    const banca = searchParams.get('banca')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    let query = supabase
      .from('concursos')
      .select(`
        *,
        vagas (
          id,
          cargo,
          local_atuacao,
          salario,
          carga_horaria,
          nivel_escolaridade,
          numero_vagas
        )
      `, { count: 'exact' })
    
    // Aplicar filtros
    if (status) {
      query = query.eq('status', status)
    }
    
    if (search) {
      query = query.or(`titulo.ilike.%${search}%,orgao.ilike.%${search}%`)
    }
    
    // Ordenação: recentes primeiro
    query = query.order('data_publicacao', { ascending: false })
    
    // Paginação
    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count
      }
    })
    
  } catch (error) {
    console.error('Erro ao buscar concursos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar concursos' },
      { status: 500 }
    )
  }
}
