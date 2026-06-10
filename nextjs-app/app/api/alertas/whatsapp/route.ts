import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { usuario_id, tipo_alerta, concurso_id, mensagem } = await request.json()
    
    // Buscar dados do usuário
    const { data: usuario } = await supabaseAdmin
      .from('usuarios')
      .select('telefone_whatsapp')
      .eq('id', usuario_id)
      .single()
    
    if (!usuario?.telefone_whatsapp) {
      return NextResponse.json(
        { error: 'Usuário sem telefone cadastrado' },
        { status: 400 }
      )
    }
    
    // Enviar WhatsApp (usando Evolution API ou similar)
    const whatsappUrl = process.env.WHATSAPP_API_URL
    const whatsappKey = process.env.WHATSAPP_API_KEY
    
    const response = await fetch(`${whatsappUrl}/message/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': whatsappKey!
      },
      body: JSON.stringify({
        number: usuario.telefone_whatsapp.replace(/\D/g, ''),
        textMessage: { text: mensagem }
      })
    })
    
    const status = response.ok ? 'enviado' : 'erro'
    
    // Registrar no banco
    await supabaseAdmin
      .from('alertas_whatsapp')
      .insert({
        usuario_id,
        tipo_alerta,
        concurso_id,
        mensagem_enviada: mensagem,
        status_envio: status
      })
    
    return NextResponse.json({ success: true, status })
    
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error)
    return NextResponse.json(
      { error: 'Erro ao enviar WhatsApp' },
      { status: 500 }
    )
  }
}
