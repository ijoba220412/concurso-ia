import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const { data: concurso, error } = await supabase
      .from('concursos')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !concurso) {
      return NextResponse.json(
        { error: 'Concurso não encontrado' },
        { status: 404 }
      )
    }
    
    // Buscar vagas
    const { data: vagas } = await supabase
      .from('vagas')
      .select(`
        *,
        materias (
          id,
          nome_materia,
          topicos,
          peso_prova
        )
      `)
      .eq('concurso_id', id)
    
    return NextResponse.json({
      ...concurso,
      vagas: vagas || []
    })
    
  } catch (error) {
    console.error('Erro ao buscar concurso:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar concurso' },
      { status: 500 }
    )
  }
}
