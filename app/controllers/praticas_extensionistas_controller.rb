class PraticasExtensionistasController < ApplicationController
  # Dados da ação de campo — ajuste somente aqui se a data ou o local mudarem.
  ACAO_DATA = "17/10/2026"
  ACAO_DATA_EXTENSO = "sábado, 17 de outubro de 2026"
  ACAO_HORARIO = "09h00 às 11h30"
  ACAO_LOCAL = "Lab 02 — Campus Maricá (FUSVE)"
  ACAO_ENDERECO = "Av. Roberto Silveira, 437 — Flamengo, Maricá/RJ"

  GITHUB_RAW = "https://github.com/PacEvill/SpecLine/raw/main/docs/academic"
  FORMS_URL = "https://forms.gle/JmWxcvbgtv3uGtpr5"

  # Pesquisa empírica original com a comunidade (38 respondentes) —
  # continua aberta para agregar mais respostas.
  PESQUISA_URL = "https://forms.gle/x1i9uhtfk5F32TAQ8"

  CRONOGRAMA = [
    {
      data: Date.new(2026, 10, 22),
      rotulo: "22/10",
      titulo: "Fechar data e local da ação",
      descricao: "Combinar com o grupo a data, o local e o resumo do trabalho.",
      tipo: "Marco"
    },
    {
      data: Date.new(2026, 11, 5),
      rotulo: "05/11",
      titulo: "Resumo do trabalho para a professora",
      descricao: "O grupo entrega o resumo do que foi feito e do que será apresentado.",
      tipo: "Entrega"
    },
    {
      data: Date.new(2026, 11, 10),
      rotulo: "10/11",
      titulo: "Resumos enviados à coordenação",
      descricao: "A professora encaminha os resumos dos grupos para a coordenação.",
      tipo: "Institucional"
    },
    {
      data: Date.new(2026, 11, 19),
      rotulo: "19/11",
      titulo: "Relatório Final + evidências (P2)",
      descricao: "Entrega do relatório com as provas da ação: lista, fotos, avaliações e depoimentos.",
      tipo: "Prazo final"
    },
    {
      data: Date.new(2026, 12, 4),
      rotulo: "04/12",
      titulo: "Mostra de Extensão de Engenharia de Software",
      descricao: "Apresentação dos trabalhos no Campus Maricá, aberta à comunidade.",
      tipo: "Evento"
    }
  ].freeze

  def index
    @acao = {
      data: ACAO_DATA,
      data_extenso: ACAO_DATA_EXTENSO,
      horario: ACAO_HORARIO,
      local: ACAO_LOCAL,
      endereco: ACAO_ENDERECO
    }

    @links = {
      plano: "#{GITHUB_RAW}/PLANO%20DE%20A%C3%87%C3%83O%20EXTENSIONISTA.pdf",
      roteiro: "#{GITHUB_RAW}/oficina-marica.pdf",
      kit: "#{GITHUB_RAW}/pei6-aula4-2026-10-01-kit.pdf",
      pesquisa: "#{GITHUB_RAW}/Relat%C3%B3rio%20de%20Pesquisa%20e%20Mercado%20-%20SpecLine.pdf",
      pesquisa_form: PESQUISA_URL,      relatorio: "#{GITHUB_RAW}/Relat%C3%B3rio%20de%20Pr%C3%A1ticas%20Extensionistas%20Integradoras%20VI%20-%20SpecLine.pdf",
      repositorio: "https://github.com/PacEvill/SpecLine",
      forms: FORMS_URL,
      plataforma: "https://specline.onrender.com",
      projeto: "/academic/extension"
    }

    @cronograma = CRONOGRAMA.map do |item|
      item.merge(status: status_para(item[:data]))
    end

    @tres_perguntas = [
      {
        numero: "01",
        pergunta: "O que você quer organizar?",
        exemplo: "Ex.: vender bolo por encomenda, organizar o TCC ou divulgar um serviço."
      },
      {
        numero: "02",
        pergunta: "Quais os 3 primeiros passos?",
        exemplo: "Pode ser simples: definir, preparar e divulgar."
      },
      {
        numero: "03",
        pergunta: "Até quando?",
        exemplo: "Uma data ajuda a transformar a ideia em tarefa."
      }
    ]

    @roteiro_10 = [
      { tempo: "0–1 min", titulo: "Entrada", descricao: "Escaneia o QR e entra direto, sem cadastro." },
      { tempo: "1–6 min", titulo: "Três perguntas", descricao: "Responde às 3 perguntas e o app monta o projeto." },
      { tempo: "6–8 min", titulo: "Um ajuste", descricao: "O aluno passa, olha e sugere um ajuste." },
      { tempo: "8–9 min", titulo: "Exportação", descricao: "Manda o projeto para o próprio WhatsApp ou baixa em PDF." },
      { tempo: "9–10 min", titulo: "Feedback", descricao: "Feedback em 1 clique e certificado." }
    ]

    @atendimento = [
      {
        titulo: "Grupos de 4 a 6",
        descricao: "Todos começam juntos com o passo a passo no telão. Cada um faz no próprio celular; o aluno explica uma vez para o grupo inteiro."
      },
      {
        titulo: "Botão “Preciso de ajuda”",
        descricao: "A pessoa toca e aparece na lista do aluno. Ele vai direto em quem travou, em vez de ficar rodando a sala."
      },
      {
        titulo: "Painel do aluno",
        descricao: "Mostra em que etapa cada participante está: entrou, respondeu, exportou. Assim ele vê na hora quem está parado."
      },
      {
        titulo: "Exemplo pronto na tela",
        descricao: "Um projeto já preenchido ao lado das perguntas, como “Bolos da Dona Ana”. Quem é iniciante copia o formato e trava menos."
      },
      {
        titulo: "Colegas como monitores",
        descricao: "Se 2 ou 3 colegas da turma ajudarem no dia, cada um cuida de um grupo. O atendimento rende muito mais."
      },
      {
        titulo: "Vários ao mesmo tempo",
        descricao: "A pessoa faz sozinha, no ritmo dela. O aluno não ensina um por um: só destrava quem empacar."
      }
    ]

    @cortes = [
      {
        titulo: "Cadastro com senha",
        descricao: "Você entra só com nome e perfil. Sem senha, sem espera."
      },
      {
        titulo: "Editor livre de diagramas",
        descricao: "O fluxograma gerado automaticamente já basta para o projeto sair pronto."
      },
      {
        titulo: "Quiz longo de antes e depois",
        descricao: "Vira 1 pergunta no início e 1 no fim, dentro do próprio assistente."
      }
    ]

    @prioridades = [
      {
        titulo: "Assistente das 3 perguntas",
        descricao: "Gerar sozinho o documento curto, as 3 tarefas com prazo e o fluxograma simples."
      },
      {
        titulo: "Entrada por QR e exportação",
        descricao: "Entrar sem cadastro e mandar o projeto para o WhatsApp ou baixar em PDF."
      },
      {
        titulo: "Ajuda e painel do aluno",
        descricao: "Botão “Preciso de ajuda” e painel para ver quem entrou, respondeu e exportou."
      }
    ]

    @metas = [
      { indicador: "Pessoas que entraram", meta: "15 a 30", realizado: "—" },
      { indicador: "Pessoas que concluíram", meta: "100%", realizado: "—" },
      { indicador: "Pessoas que exportaram", meta: "100%", realizado: "—" },
      { indicador: "Lista de presença assinada", meta: "100%", realizado: "—" },
      { indicador: "Avaliações respondidas", meta: "100%", realizado: "—" },
      { indicador: "Fotos datadas", meta: "5 a 10", realizado: "—" },
      { indicador: "Carga horária registrada", meta: "por integrante", realizado: "—" }
    ]

    @evidencias = [
      {
        titulo: "Lista de presença",
        descricao: "Nome, atividade e assinatura de cada participante.",
        detalhe: "Modelo no kit de campo",
        link: @links[:kit]
      },
      {
        titulo: "Termo de imagem e voz",
        descricao: "Assinado antes de qualquer foto ou gravação.",
        detalhe: "Modelo no kit de campo",
        link: @links[:kit]
      },
      {
        titulo: "Termo para menor de idade",
        descricao: "Assinatura do responsável quando houver participante menor.",
        detalhe: "Modelo no kit de campo",
        link: @links[:kit]
      },
      {
        titulo: "Feedback + certificado",
        descricao: "Uma pergunta no início e uma no fim; ao final, o certificado.",
        detalhe: "Formulário online",
        link: @links[:forms]
      },
      {
        titulo: "Fotos datadas",
        descricao: "De 5 a 10 fotos com data e legenda, sem rostos não autorizados.",
        detalhe: "Anexo do relatório"
      },
      {
        titulo: "Depoimentos curtos",
        descricao: "Duas ou três falas de participantes sobre o que mudou.",
        detalhe: "Texto livre"
      },
      {
        titulo: "Carga horária",
        descricao: "Soma das horas de cada integrante da equipe.",
        detalhe: "Planilha simples"
      },
      {
        titulo: "Metas x alcançado",
        descricao: "Compare o que o plano prometeu com o que aconteceu.",
        detalhe: "Tabela abaixo"
      },
      {
        titulo: "Painel do aluno",
        descricao: "Registre quantas pessoas entraram, concluíram e exportaram o projeto.",
        detalhe: "Evidência de impacto"
      },
      {
        titulo: "Dificuldades e aprendizados",
        descricao: "O que deu certo, o que travou e o que o grupo aprendeu.",
        detalhe: "Texto livre"
      }
    ]

    @resumo_mostra = <<~TEXTO
      O SpecLine é uma plataforma gratuita que ajuda estudantes, profissionais iniciantes e pequenos empreendedores de Maricá a organizar documentos, tarefas e diagramas em um só lugar. Na ação extensionista, cada participante respondeu a 3 perguntas e saiu com um documento curto, 3 tarefas com prazo e um fluxograma simples. A oficina atendeu [NÚMERO] pessoas em cerca de 10 minutos por participante; [NÚMERO] concluíram o projeto e [NÚMERO] exportaram para WhatsApp ou PDF. A experiência mostrou [PRINCIPAL APRENDIZADO] e deixou como continuidade [O QUE FICA PARA A COMUNIDADE].
    TEXTO
  end

  # Mini-formulário escondido: guarda interesse da comunidade sem cadastro.
  # Honeypot simples: bots preenchem o campo "website" e são descartados.
  def registro
    return redirect_to praticas_extensionistas_path(anchor: "inscricao") if params[:website].present?

    registro = PraticaRegistro.new(
      nome: params[:nome].to_s.squish,
      contato: params[:contato].to_s.squish,
      ideia: params[:ideia].to_s.presence&.squish,
      origem: "site"
    )

    if registro.save
      redirect_to praticas_extensionistas_path(anchor: "inscricao"),
        notice: "Tudo certo! Pegamos seu nome e sua ideia. A gente aciona você antes da oficina."
    else
      redirect_to praticas_extensionistas_path(anchor: "inscricao"),
        alert: "Faltou o nome ou o contato. Confere e tenta de novo — leva 30 segundos."
    end
  end

  private

  def status_para(data)
    return "Concluído" if data < Date.current
    return "Hoje" if data == Date.current

    "A fazer"
  end
end
