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
      resources :milestones, except: [:index]
      resources :documents do
        member do
          post :duplicate
          get :export
          patch :move
        end
      end
      resources :whiteboards do
        member do
          post :duplicate
          get :export_json
          get :export_svg
        end
      end
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
  devise_for :users, controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks',
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }
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

  # Legal & Institutional Pages
  get "terms", to: "legal#terms"
  get "privacy", to: "legal#privacy"
  get "contact", to: "legal#contact"

  # Health Check
  get "up" => "rails/health#show", as: :rails_health_check
end
