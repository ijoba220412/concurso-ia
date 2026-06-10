-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: usuarios
create table usuarios (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  nome text not null,
  telefone_whatsapp text,
  criado_em timestamptz default now(),
  updated_at timestamptz default now()
);

-- Table: concursos
create table concursos (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  orgao text not null,
  banca_organizadora text not null,
  numero_edital text,
  data_publicacao date not null,
  data_inicio_inscricoes date,
  data_fim_inscricoes date not null,
  data_prova date,
  valor_taxa_inscricao numeric(10,2),
  link_edital_original text,
  resumo_ia text not null,
  status text not null default 'aberto',
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Table: vagas
create table vagas (
  id uuid primary key default uuid_generate_v4(),
  concurso_id uuid not null references concursos(id) on delete cascade,
  cargo text not null,
  local_atuacao text not null,
  numero_vagas integer not null,
  salario numeric(10,2) not null,
  carga_horaria numeric(5,2),
  nivel_escolaridade text not null,
  formacao_exigida text not null,
  exige_prova_titulos boolean default false,
  descricao_adicional text,
  criado_em timestamptz default now()
);

-- Table: materias
create table materias (  id uuid primary key default uuid_generate_v4(),
  vaga_id uuid not null references vagas(id) on delete cascade,
  nome_materia text not null,
  topicos text not null,
  peso_prova numeric(3,2),
  criado_em timestamptz default now()
);

-- Table: inscricoes (user tracking)
create table inscricoes (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  vaga_id uuid not null references vagas(id) on delete cascade,
  inscrito boolean default false,
  anotacoes_pessoais text,
  inscrito_em timestamptz default now(),
  atualizado_em timestamptz default now(),
  unique(usuario_id, vaga_id)
);

-- Table: alertas_whatsapp
create table alertas_whatsapp (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  tipo_alerta text not null,
  concurso_id uuid references concursos(id),
  mensagem_enviada text not null,
  enviado_em timestamptz default now(),
  status_envio text not null default 'pendente'
);

-- Indexes for performance
create index idx_concursos_status on concursos(status);
create index idx_concursos_data_fim_inscricoes on concursos(data_fim_inscricoes);
create index idx_vagas_concurso_id on vagas(concurso_id);
create index idx_vagas_local_atuacao on vagas(local_atuacao);
create index idx_vagas_nivel_escolaridade on vagas(nivel_escolaridade);
create index idx_vagas_salario on vagas(salario);
create index idx_materias_vaga_id on materias(vaga_id);
create index idx_inscricoes_usuario_id on inscricoes(usuario_id);

-- Row Level Security (RLS)
alter table usuarios enable row level security;
alter table concursos enable row level security;
alter table vagas enable row level security;
alter table materias enable row level security;
alter table inscricoes enable row level security;
alter table alertas_whatsapp enable row level security;

-- Policiescreate policy "Usuarios podem ver seus dados"
  on usuarios for select
  using (auth.uid() = id);

create policy "Concursos são públicos"
  on concursos for select
  using (true);

create policy "Vagas são públicas"
  on vagas for select
  using (true);

create policy "Matérias são públicas"
  on materias for select
  using (true);

create policy "Usuarios veem suas inscricoes"
  on inscricoes for all
  using (auth.uid() = usuario_id);

create policy "Usuarios veem seus alertas"
  on alertas_whatsapp for all
  using (auth.uid() = usuario_id);

-- Function to update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers
create trigger update_usuarios_updated_at
  before update on usuarios
  for each row
  execute function update_updated_at_column();

create trigger update_concursos_updated_at
  before update on concursos
  for each row
  execute function update_updated_at_column();

create trigger update_inscricoes_updated_at
  before update on inscricoes
  for each row
  execute function update_updated_at_column();
