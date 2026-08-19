Rails.application.routes.draw do
  # App Core (Autenticado)
  resources :workspaces do
    resources :labels, except: [:index, :show]
    resources :projects do
      resources :issue_statuses, except: [:index, :show] do
        member do
          patch :move
        end
      end
      resources :boards, only: [:new, :create, :edit, :update, :destroy]
      resources :issues, except: [:index] do
        member do
          patch :move  # Para drag-and-drop do Kanban
        end
        resources :comments, only: [:create, :destroy]
      end
      resources :milestones
      resources :documents
    end
  end

  # Busca Global
  get "search", to: "search#index"

  # Minhas Tarefas
  get "my_tasks", to: "my_tasks#index"

  # Atividades (real)
  get "activities", to: "activities#index"

  # Preferências do Usuário
  resource :preferences, only: [:show, :update]

  # Autenticação
  devise_for :users
  devise_scope :user do
    get '/register', to: 'devise/registrations#new'
  end

  # Marketing / Institucional
  root "home#index"
  get "home/index"
  get "pricing", to: "home#pricing"
  get "changelog", to: "changelog#index"

  # Features Pages
  get "features/docs", to: "features#docs"
  get "features/kanban", to: "features#kanban"
  get "features/chat", to: "features#chat"
  get "features/whiteboard", to: "features#whiteboard"

  # Philosophy & Solutions Pages
  get "philosophy/vision", to: "philosophy#vision"
  get "philosophy/focus", to: "philosophy#focus"
  get "solutions/startups", to: "solutions#startups"
  get "solutions/agencies", to: "solutions#agencies"
  get "solutions/product", to: "solutions#product"

  # Health Check
  get "up" => "rails/health#show", as: :rails_health_check
end
